const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
	__internal: {
		engine: {
			type: 'library'
		}
	}
});

const PRODUCT_CATEGORY_SELECT = {
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

// GET /api/category
exports.getActiveCategories = async (_req, res) => {
	try {
		const categories = await prisma.category.findMany({
			where: {
				isActive: true
			},
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				image: true,
				isFeatured: true,
				_count: {
					select: {
						products: {
							where: { status: 'ACTIVE' }
						}
					}
				}
			}
		});

		const payload = categories.map((category) => ({
			id: category.id,
			name: category.name,
			slug: category.slug,
			description: category.description,
			image: category.image,
			isFeatured: category.isFeatured,
			productCount: category._count.products
		}));

		res.status(200).json({ categories: payload });
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
	}
};

// GET /api/category/:slug
exports.getCategoryBySlugWithProducts = async (req, res) => {
	try {
		const slug = String(req.params.slug || '').trim();
		if (!slug) {
			return res.status(400).json({ message: 'Category slug is required' });
		}

		const page = Math.max(parseInt(req.query.page || '1', 10), 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
		const skip = (page - 1) * limit;

		const search = String(req.query.search || '').trim();
		const sort = String(req.query.sort || 'popular').trim();
		const minPriceInput = req.query.minPrice;
		const maxPriceInput = req.query.maxPrice;

		const minPrice = minPriceInput === undefined || minPriceInput === '' ? null : Number(minPriceInput);
		const maxPrice = maxPriceInput === undefined || maxPriceInput === '' ? null : Number(maxPriceInput);

		const category = await prisma.category.findFirst({
			where: {
				slug,
				isActive: true
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				image: true,
				isFeatured: true
			}
		});

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		const where = {
			categoryId: category.id,
			status: 'ACTIVE'
		};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ slug: { contains: search, mode: 'insensitive' } }
			];
		}

		if (minPrice !== null || maxPrice !== null) {
			where.price = {};
			if (Number.isFinite(minPrice)) {
				where.price.gte = minPrice;
			}
			if (Number.isFinite(maxPrice)) {
				where.price.lte = maxPrice;
			}
		}

		let orderBy;
		switch (sort) {
			case 'price-low':
				orderBy = { price: 'asc' };
				break;
			case 'price-high':
				orderBy = { price: 'desc' };
				break;
			case 'latest':
				orderBy = { createdAt: 'desc' };
				break;
			default:
				orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
		}

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				skip,
				take: limit,
				orderBy,
				select: PRODUCT_CATEGORY_SELECT
			}),
			prisma.product.count({ where })
		]);

		res.status(200).json({
			category,
			products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch category products', error: err.message });
	}
};
