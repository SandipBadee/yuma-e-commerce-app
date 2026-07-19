const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
	__internal: {
		engine: {
			type: 'library'
		}
	}
});

const PRODUCT_PUBLIC_SELECT = {
	id: true,
	name: true,
	slug: true,
	productCode: true,
	description: true,
	price: true,
	salePrice: true,
	discountType: true,
	stock: true,
	quantity: true,
	unit: true,
	images: true,
	isFeatured: true,
	createdAt: true,
	updatedAt: true,
	category: {
		select: {
			id: true,
			name: true,
			slug: true
		}
	}
};

const PRODUCT_REVIEW_SELECT = {
	id: true,
	rating: true,
	comment: true,
	createdAt: true,
	user: {
		select: {
			id: true,
			name: true
		}
	}
};

// GET /api/products
exports.getAllProducts = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page || '1', 10), 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
		const skip = (page - 1) * limit;

		const search = String(req.query.search || '').trim();
		const category = String(req.query.category || '').trim();
		const where = { status: 'ACTIVE' };

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ slug: { contains: search, mode: 'insensitive' } }
			];
		}

		if (category) {
			where.category = { slug: category };
		}

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: PRODUCT_PUBLIC_SELECT
			}),
			prisma.product.count({ where })
		]);

		res.status(200).json({
			products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch products', error: err.message });
	}
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res) => {
	try {
		const slug = String(req.params.slug || '').trim();
		if (!slug) {
			return res.status(400).json({ message: 'Product slug is required' });
		}

		const product = await prisma.product.findFirst({
			where: {
				slug,
				status: 'ACTIVE'
			},
			select: PRODUCT_PUBLIC_SELECT
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		res.status(200).json(product);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch product', error: err.message });
	}
};

// GET /api/products/:slug/reviews
exports.getProductReviewsBySlug = async (req, res) => {
	try {
		const slug = String(req.params.slug || '').trim();
		if (!slug) {
			return res.status(400).json({ message: 'Product slug is required' });
		}

		const page = Math.max(parseInt(req.query.page || '1', 10), 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
		const skip = (page - 1) * limit;

		const product = await prisma.product.findFirst({
			where: { slug },
			select: { id: true }
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		const where = {
			productId: product.id,
			isActive: true
		};

		const [reviews, total] = await Promise.all([
			prisma.productReview.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: PRODUCT_REVIEW_SELECT
			}),
			prisma.productReview.count({ where })
		]);

		res.status(200).json({
			reviews,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch product reviews', error: err.message });
	}
};

// POST /api/products/:slug/reviews
exports.createProductReviewBySlug = async (req, res) => {
	try {
		const slug = String(req.params.slug || '').trim();
		const rating = parseInt(req.body?.rating, 10);
		const normalizedComment = req.body?.comment ? String(req.body.comment).trim() : '';

		if (!slug) {
			return res.status(400).json({ message: 'Product slug is required' });
		}

		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
		}

		if (normalizedComment.length > 500) {
			return res.status(400).json({ message: 'Comment must be 500 characters or fewer' });
		}

		const product = await prisma.product.findFirst({
			where: { slug },
			select: { id: true }
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		const existingReview = await prisma.productReview.findUnique({
			where: {
				userId_productId: {
					userId: req.user.id,
					productId: product.id
				}
			},
			select: { id: true }
		});

		if (existingReview) {
			return res.status(400).json({ message: 'You have already reviewed this product' });
		}

		const review = await prisma.productReview.create({
			data: {
				rating,
				comment: normalizedComment || null,
				userId: req.user.id,
				productId: product.id,
				isActive: true
			},
			select: PRODUCT_REVIEW_SELECT
		});

		res.status(201).json({ message: 'Review added successfully', review });
	} catch (err) {
		if (err.code === 'P2002') {
			return res.status(400).json({ message: 'You have already reviewed this product' });
		}

		res.status(500).json({ message: 'Failed to add review', error: err.message });
	}
};
