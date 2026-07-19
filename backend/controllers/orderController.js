const { PrismaClient } = require('@prisma/client');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

const prisma = new PrismaClient({
	__internal: {
		engine: {
			type: 'library'
		}
	}
});

const ORDER_SAFE_SELECT = {
	id: true,
	orderNumber: true,
	totalAmount: true,
	status: true,
	orderType: true,
	shippingAddress: true,
	phone: true,
	createdAt: true,
	items: {
		select: {
			id: true,
			quantity: true,
			price: true,
			product: {
				select: {
					id: true,
					name: true,
					slug: true,
					images: true
				}
			}
		}
	}
};

const ADMIN_ORDER_STATUSES = [
	'PENDING',
	'PROCESSING',
	'READY_FOR_PICKUP',
	'SHIPPED',
	'DELIVERED',
	'COMPLETED',
	'CANCELLED',
	'REFUNDED'
];

const ADMIN_ORDER_LIST_SELECT = {
	id: true,
	orderNumber: true,
	status: true,
	orderType: true,
	totalAmount: true,
	createdAt: true,
	user: {
		select: {
			id: true,
			email: true,
			name: true
		}
	},
	_count: {
		select: {
			items: true
		}
	}
};

function normalizeOrderType(orderType) {
	const value = String(orderType || 'PICKUP').toUpperCase();
	return value === 'DELIVERY' ? 'DELIVERY' : 'PICKUP';
}

function parseCartItems(rawItems) {
	if (!Array.isArray(rawItems) || rawItems.length === 0) {
		return [];
	}

	return rawItems
		.map((item) => ({
			productId: String(item?.productId || item?.id || '').trim(),
			quantity: Number.parseInt(String(item?.quantity ?? item?.qty ?? ''), 10)
		}))
		.filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);
}

function toNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function isValidEuPhone(phone) {
	const normalized = String(phone || '').trim();
	return /^\+?[0-9()\-\s]{8,20}$/.test(normalized);
}

function isValidFinnishPostalCode(postalCode) {
	return /^\d{5}$/.test(String(postalCode || '').trim());
}

function buildShippingAddress(orderType, customer) {
	if (orderType === 'PICKUP') {
		return 'Pickup at store';
	}

	const line1 = String(customer.addressLine1 || '').trim();
	const line2 = String(customer.addressLine2 || '').trim();
	const postalCode = String(customer.postalCode || '').trim();
	const city = String(customer.city || '').trim();
	const country = String(customer.country || 'Finland').trim();

	return [
		line1,
		line2 || null,
		`${postalCode} ${city}`.trim(),
		country
	]
		.filter(Boolean)
		.join(', ');
}

function buildPickupAddressWithSchedule(scheduleType, scheduledAt) {
	if (scheduleType === 'scheduled' && scheduledAt) {
		return `Pickup at store (Scheduled: ${scheduledAt})`;
	}

	return 'Pickup at store';
}

async function getStoreSettings() {
	return prisma.siteSettings.upsert({
		where: { id: 'singleton' },
		update: {},
		create: { id: 'singleton' },
		select: {
			deliveryFee: true,
			minOrderForFreeDelivery: true
		}
	});
}

async function calculateCheckout(items, orderType) {
	const productIds = [...new Set(items.map((item) => item.productId))];
	const products = await prisma.product.findMany({
		where: {
			id: { in: productIds }
		},
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			price: true,
			salePrice: true,
			stock: true,
			images: true
		}
	});

	const productMap = new Map(products.map((product) => [product.id, product]));
	const preparedItems = [];
	const unavailableItems = [];

	for (const item of items) {
		const product = productMap.get(item.productId);
		if (!product) {
			unavailableItems.push({
				productId: item.productId,
				name: null,
				reason: 'NOT_FOUND'
			});
			continue;
		}

		if (product.status !== 'ACTIVE') {
			unavailableItems.push({
				productId: item.productId,
				name: product.name,
				reason: 'INACTIVE'
			});
			continue;
		}

		if (item.quantity > product.stock) {
			unavailableItems.push({
				productId: item.productId,
				name: product.name,
				reason: 'INSUFFICIENT_STOCK',
				requestedQuantity: item.quantity,
				availableQuantity: product.stock
			});
			continue;
		}

		const unitPrice = toNumber(product.salePrice ?? product.price);
		const lineTotal = unitPrice * item.quantity;

		preparedItems.push({
			productId: product.id,
			name: product.name,
			slug: product.slug,
			image: Array.isArray(product.images) && product.images[0] ? product.images[0] : null,
			quantity: item.quantity,
			unitPrice,
			lineTotal
		});
	}

	if (unavailableItems.length > 0) {
		return {
			error: 'Some items in your cart are unavailable',
			status: 409,
			code: 'ITEMS_UNAVAILABLE',
			unavailableItems
		};
	}

	const subtotal = preparedItems.reduce((sum, item) => sum + item.lineTotal, 0);
	const settings = await getStoreSettings();
	const deliveryFeeSetting = toNumber(settings.deliveryFee);
	const minOrderForFreeDelivery = toNumber(settings.minOrderForFreeDelivery);

	const isDelivery = orderType === 'DELIVERY';
	const isFreeDelivery = isDelivery && subtotal >= minOrderForFreeDelivery;
	const deliveryFee = isDelivery ? (isFreeDelivery ? 0 : deliveryFeeSetting) : 0;
	const totalAmount = subtotal + deliveryFee;

	return {
		items: preparedItems,
		pricing: {
			subtotal,
			deliveryFee,
			minOrderForFreeDelivery,
			isFreeDelivery,
			totalAmount,
			currency: 'EUR'
		}
	};
}

function validateCustomer(orderType, customer) {
	const firstName = String(customer?.firstName || '').trim();
	const lastName = String(customer?.lastName || '').trim();
	const email = String(customer?.email || '').trim();
	const phone = String(customer?.phone || '').trim();

	if (firstName.length < 2 || lastName.length < 2) {
		return 'First name and last name must be at least 2 characters';
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return 'Invalid email format';
	}

	if (!isValidEuPhone(phone)) {
		return 'Phone number must match Finnish/European format';
	}

	if (orderType === 'DELIVERY') {
		const addressLine1 = String(customer?.addressLine1 || '').trim();
		const postalCode = String(customer?.postalCode || '').trim();
		const city = String(customer?.city || '').trim();
		const country = String(customer?.country || 'Finland').trim();

		if (!addressLine1 || addressLine1.length < 3) {
			return 'Street address is required for delivery';
		}

		if (!isValidFinnishPostalCode(postalCode)) {
			return 'Finnish postal code must be exactly 5 digits';
		}

		if (!city || city.length < 2) {
			return 'City is required for delivery';
		}

		if (!country) {
			return 'Country is required for delivery';
		}
	}

	return null;
}

function generateOrderNumber() {
	const tsPart = Date.now().toString(36).toUpperCase().slice(-6);
	const random = Math.floor(100 + Math.random() * 900);
	return `HSR-${tsPart}-${random}`;
}

function buildPricingBreakdownFromOrder(order) {
	const subtotal = (order.items || []).reduce(
		(sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
		0
	);
	const totalAmount = Number(order.totalAmount || 0);
	const deliveryFee = Math.max(0, totalAmount - subtotal);

	return {
		subtotal,
		deliveryFee,
		totalAmount,
		currency: 'EUR'
	};
}

// POST /api/orders/checkout-summary
exports.getCheckoutSummary = async (req, res) => {
	try {
		const orderType = normalizeOrderType(req.body?.orderType);
		const items = parseCartItems(req.body?.items);

		if (items.length === 0) {
			return res.status(400).json({ message: 'Cart items are required' });
		}

		const summary = await calculateCheckout(items, orderType);
		if (summary.error) {
			return res.status(summary.status).json({
				message: summary.error,
				code: summary.code,
				unavailableItems: summary.unavailableItems || []
			});
		}

		return res.status(200).json({
			orderType,
			items: summary.items,
			pricing: summary.pricing
		});
	} catch (err) {
		return res.status(500).json({ message: 'Failed to build checkout summary', error: err.message });
	}
};

// POST /api/orders
exports.createOrder = async (req, res) => {
	try {
		const orderType = normalizeOrderType(req.body?.orderType);
		const scheduleType = String(req.body?.scheduleType || 'asap').toLowerCase();
		const scheduledAtRaw = req.body?.scheduledAt;
		const scheduledAt = scheduledAtRaw ? String(scheduledAtRaw).trim() : null;
		const items = parseCartItems(req.body?.items);
		const customer = req.body?.customer || {};

		if (items.length === 0) {
			return res.status(400).json({ message: 'Cart items are required' });
		}

		const customerValidationError = validateCustomer(orderType, customer);
		if (customerValidationError) {
			return res.status(400).json({ message: customerValidationError });
		}

		const summary = await calculateCheckout(items, orderType);
		if (summary.error) {
			return res.status(summary.status).json({
				message: summary.error,
				code: summary.code,
				unavailableItems: summary.unavailableItems || []
			});
		}

		const shippingAddress = orderType === 'PICKUP'
			? buildPickupAddressWithSchedule(scheduleType, scheduledAt)
			: buildShippingAddress(orderType, customer);
		const orderNumber = generateOrderNumber();

		const order = await prisma.$transaction(async (tx) => {
			const createdOrder = await tx.order.create({
				data: {
					orderNumber,
					userId: req.user.id,
					totalAmount: summary.pricing.totalAmount,
					status: 'PENDING',
					orderType,
					shippingAddress,
					phone: String(customer.phone).trim(),
					items: {
						create: summary.items.map((item) => ({
							productId: item.productId,
							quantity: item.quantity,
							price: item.unitPrice
						}))
					}
				},
				select: ORDER_SAFE_SELECT
			});

			for (const item of summary.items) {
				await tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							decrement: item.quantity
						}
					}
				});
			}

			return createdOrder;
		});

		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: { email: true }
		});

		if (user?.email) {
			const mailResult = await sendOrderConfirmationEmail(user.email, {
				orderNumber,
				orderType,
				scheduleType,
				scheduledAt,
				shippingAddress,
				phone: String(customer.phone || '').trim(),
				subtotal: summary.pricing.subtotal,
				deliveryFee: summary.pricing.deliveryFee,
				totalAmount: summary.pricing.totalAmount,
				items: summary.items
			});

			if (mailResult?.previewUrl) {
				console.log('Order confirmation preview URL:', mailResult.previewUrl);
			}
		}

		return res.status(201).json({
			message: 'Order created successfully',
			order,
			scheduleType,
			scheduledAt,
			pricing: summary.pricing
		});
	} catch (err) {
		if (err.code === 'P2002') {
			return res.status(409).json({ message: 'Could not generate unique order number. Please try again.' });
		}

		return res.status(500).json({ message: 'Failed to create order', error: err.message });
	}
};

// GET /api/orders/:orderNumber
exports.getMyOrderByNumber = async (req, res) => {
	try {
		const orderNumber = String(req.params.orderNumber || '').trim();
		if (!orderNumber) {
			return res.status(400).json({ message: 'Order number is required' });
		}

		const order = await prisma.order.findFirst({
			where: {
				orderNumber,
				userId: req.user.id
			},
			select: ORDER_SAFE_SELECT
		});

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		const pricing = buildPricingBreakdownFromOrder(order);

		return res.status(200).json({ order, pricing });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch order details', error: err.message });
	}
};

// GET /api/orders/mine
exports.getMyOrders = async (req, res) => {
	try {
		const limitRaw = Number.parseInt(String(req.query?.limit ?? '10'), 10);
		const limit = Number.isInteger(limitRaw) ? Math.min(Math.max(limitRaw, 1), 25) : 10;

		const orders = await prisma.order.findMany({
			where: { userId: req.user.id },
			orderBy: { createdAt: 'desc' },
			take: limit,
			select: {
				id: true,
				orderNumber: true,
				status: true,
				orderType: true,
				totalAmount: true,
				createdAt: true,
				_count: {
					select: {
						items: true
					}
				}
			}
		});

		return res.status(200).json({ orders });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch order history', error: err.message });
	}
};

// GET /api/orders/admin
exports.getAdminOrders = async (req, res) => {
	try {
		const pageRaw = Number.parseInt(String(req.query?.page ?? '1'), 10);
		const limitRaw = Number.parseInt(String(req.query?.limit ?? '10'), 10);
		const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
		const limit = Number.isInteger(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 10;
		const status = String(req.query?.status || '').trim().toUpperCase();
		const orderType = String(req.query?.orderType || '').trim().toUpperCase();
		const search = String(req.query?.search || '').trim();

		const where = {};
		if (status) {
			if (!ADMIN_ORDER_STATUSES.includes(status)) {
				return res.status(400).json({ message: 'Invalid status filter' });
			}
			where.status = status;
		}

		if (orderType && orderType !== 'DELIVERY' && orderType !== 'PICKUP') {
			return res.status(400).json({ message: 'Invalid order type filter' });
		}
		if (orderType === 'DELIVERY' || orderType === 'PICKUP') where.orderType = orderType;
		if (search) {
			where.OR = [
				{ orderNumber: { contains: search, mode: 'insensitive' } },
				{ user: { email: { contains: search, mode: 'insensitive' } } },
				{ user: { name: { contains: search, mode: 'insensitive' } } }
			];
		}

		const [totalItems, orders] = await Promise.all([
			prisma.order.count({ where }),
			prisma.order.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: (page - 1) * limit,
				take: limit,
				select: ADMIN_ORDER_LIST_SELECT
			})
		]);

		const totalPages = Math.max(1, Math.ceil(totalItems / limit));

		return res.status(200).json({
			orders,
			pagination: {
				page,
				limit,
				totalItems,
				totalPages
			}
		});
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch admin orders', error: err.message });
	}
};

// GET /api/orders/admin/:id
exports.getAdminOrderById = async (req, res) => {
	try {
		const orderId = String(req.params.id || '').trim();
		if (!orderId) {
			return res.status(400).json({ message: 'Order id is required' });
		}

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: {
				...ORDER_SAFE_SELECT,
				updatedAt: true,
				user: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		});

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		const pricing = buildPricingBreakdownFromOrder(order);

		return res.status(200).json({ order, pricing });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch admin order details', error: err.message });
	}
};

// PATCH /api/orders/admin/:id/status
exports.updateOrderStatusAdmin = async (req, res) => {
	try {
		const orderId = String(req.params.id || '').trim();
		const nextStatus = String(req.body?.status || '').trim().toUpperCase();

		if (!orderId) {
			return res.status(400).json({ message: 'Order id is required' });
		}

		if (!ADMIN_ORDER_STATUSES.includes(nextStatus)) {
			return res.status(400).json({ message: 'Invalid order status' });
		}

		const existingOrder = await prisma.order.findUnique({
			where: { id: orderId },
			select: {
				id: true,
				orderNumber: true,
				status: true,
				totalAmount: true,
				orderType: true,
				user: {
					select: {
						email: true
					}
				}
			}
		});

		if (!existingOrder) {
			return res.status(404).json({ message: 'Order not found' });
		}

		if (existingOrder.status === nextStatus) {
			return res.status(200).json({ message: 'Order status is already set', order: existingOrder });
		}

		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: { status: nextStatus },
			select: {
				id: true,
				orderNumber: true,
				status: true,
				totalAmount: true,
				orderType: true,
				updatedAt: true
			}
		});

		let emailWarning = null;

		if (existingOrder.user?.email) {
			try {
				const mailResult = await sendOrderStatusUpdateEmail(existingOrder.user.email, {
					orderNumber: updatedOrder.orderNumber,
					status: updatedOrder.status,
					orderType: updatedOrder.orderType,
					totalAmount: updatedOrder.totalAmount
				});

				if (mailResult?.previewUrl) {
					console.log('Order status update preview URL:', mailResult.previewUrl);
				}
			} catch (mailError) {
				emailWarning = 'Order status updated, but customer notification email could not be sent.';
				console.error('Order status email failed:', mailError?.message || mailError);
			}
		}

		return res.status(200).json({
			message: 'Order status updated successfully',
			warning: emailWarning,
			order: updatedOrder
		});
	} catch (err) {
		if (
			err?.name === 'PrismaClientValidationError' ||
			String(err?.message || '').includes('Invalid value for argument `status`')
		) {
			return res.status(400).json({
				message: 'This status is not supported by the current database enum. Please run Prisma migration and regenerate client.'
			});
		}

		return res.status(500).json({ message: 'Failed to update order status', error: err.message });
	}
};
