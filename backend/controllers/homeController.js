const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  __internal: {
    engine: {
      type: 'library'
    }
  }
});

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  discountType: true,
  quantity: true,
  unit: true,
  stock: true,
  images: true,
  isFeatured: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  }
};

// GET /api/home
exports.getHomeData = async (_req, res) => {
  try {
    const [heroSlides, popularCategories, discountedProducts, featuredProducts, newItems] = await Promise.all([
      prisma.heroSlider.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          subtitle: true,
          image: true,
          link: true,
          priority: true
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        take: 6
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          isFeatured: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          description: true,
          isFeatured: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 8
      }),
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          salePrice: { not: null }
        },
        select: PRODUCT_SELECT,
        orderBy: { updatedAt: 'desc' },
        take: 8
      }),
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          isFeatured: true
        },
        select: PRODUCT_SELECT,
        orderBy: { updatedAt: 'desc' },
        take: 8
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: PRODUCT_SELECT,
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.status(200).json({
      heroSlides,
      popularCategories,
      discountedProducts,
      featuredProducts,
      newItems
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch home data', error: err.message });
  }
};
