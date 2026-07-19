const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  __internal: {
    engine: {
      type: "library",
    },
  },
});

const VALID_USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];
const VALID_PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "DISCONTINUED"];
const VALID_DISCOUNT_TYPES = ["NONE", "PERCENTAGE", "FLAT"];
const VALID_CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"];
const VALID_REVIEW_STATUSES = ["ACTIVE", "INACTIVE"];
const VALID_HERO_SLIDER_STATUSES = ["ACTIVE", "INACTIVE"];
const VALID_PRODUCT_SORTS = [
  "stock",
  "discounted_first",
  "price",
  "max_discount_first",
];

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

const PRODUCT_SAFE_SELECT = {
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
  status: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

const CATEGORY_SAFE_SELECT = {
  id: true,
  name: true,
  slug: true,
  image: true,
  description: true,
  isActive: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
    },
  },
};

const REVIEW_SAFE_SELECT = {
  id: true,
  rating: true,
  comment: true,
  isActive: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

const HERO_SLIDER_SAFE_SELECT = {
  id: true,
  title: true,
  subtitle: true,
  image: true,
  link: true,
  isActive: true,
  priority: true,
  createdAt: true,
};

const SITE_SETTINGS_SAFE_SELECT = {
  id: true,
  storeName: true,
  contactEmail: true,
  contactPhone: true,
  deliveryFee: true,
  minOrderForFreeDelivery: true,
  isStoreOpen: true,
  maintenanceMode: true,
  updatedAt: true,
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSortableNumber = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;

  if (value && typeof value.toNumber === "function") {
    const nextParsed = Number(value.toNumber());
    return Number.isFinite(nextParsed) ? nextParsed : 0;
  }

  return 0;
};

const getDiscountMetrics = (product) => {
  const price = toSortableNumber(product?.price);
  const salePrice =
    product?.salePrice == null ? null : toSortableNumber(product.salePrice);

  if (salePrice == null || price <= 0 || salePrice >= price) {
    return {
      hasDiscount: 0,
      discountPercent: 0,
      discountAmount: 0,
    };
  }

  const discountAmount = price - salePrice;
  const discountPercent = (discountAmount / price) * 100;

  return {
    hasDiscount: 1,
    discountPercent,
    discountAmount,
  };
};

const parseInteger = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildUniqueProductSlug = async (rawSlug, excludeId) => {
  const base = slugify(rawSlug);
  if (!base) return null;

  let attempt = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: attempt },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return attempt;
    }

    counter += 1;
    attempt = `${base}-${counter}`;
  }
};

const buildUniqueCategorySlug = async (rawSlug, excludeId) => {
  const base = slugify(rawSlug);
  if (!base) return null;

  let attempt = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: attempt },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return attempt;
    }

    counter += 1;
    attempt = `${base}-${counter}`;
  }
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
};

const pickUpdateFields = async (body) => {
  const data = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.role !== undefined) data.role = body.role;
  if (body.status !== undefined) {
    if (!VALID_USER_STATUSES.includes(body.status)) {
      throw new Error("Status must be ACTIVE, INACTIVE, BLOCKED, or DELETED");
    }
    data.status = body.status;
  }
  if (body.isVerified !== undefined) data.isVerified = body.isVerified;

  if (body.password !== undefined) {
    if (!body.password || String(body.password).trim().length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    data.password = await bcrypt.hash(String(body.password), 10);
  }

  return data;
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, status, isVerified } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    if (String(name).trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters long" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const finalRole =
      role && ["ADMIN", "CUSTOMER"].includes(role) ? role : "CUSTOMER";
    const finalStatus =
      status && VALID_USER_STATUSES.includes(status) ? status : "ACTIVE";
    const finalVerified = typeof isVerified === "boolean" ? isVerified : false;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await prisma.user.create({
      data: {
        email: String(email).trim(),
        password: hashedPassword,
        name: String(name).trim(),
        role: finalRole,
        status: finalStatus,
        isVerified: finalVerified,
        verificationToken: finalVerified ? null : undefined,
      },
      select: USER_SAFE_SELECT,
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Email already in use" });
    }

    res
      .status(500)
      .json({ message: "Failed to create user", error: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;
    const isVerified = parseBoolean(req.query.isVerified);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      if (!VALID_USER_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter value" });
      }

      where.status = status;
    }

    if (typeof isVerified === "boolean") {
      where.isVerified = isVerified;
    }

    if (search && String(search).trim()) {
      where.OR = [
        { email: { contains: String(search), mode: "insensitive" } },
        { name: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: USER_SAFE_SELECT,
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = await pickUpdateFields(req.body);
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    if (
      err.message === "Status must be ACTIVE, INACTIVE, BLOCKED, or DELETED"
    ) {
      return res.status(400).json({ message: err.message });
    }

    if (err.code === "P2002") {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (err.message === "Password must be at least 6 characters") {
      return res.status(400).json({ message: err.message });
    }

    res
      .status(500)
      .json({ message: "Failed to update user", error: err.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["ADMIN", "CUSTOMER"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be ADMIN or CUSTOMER" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "User role updated successfully", user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user role", error: err.message });
  }
};

// PATCH /api/admin/users/:id/verify
exports.setUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verified = parseBoolean(req.body.isVerified);

    if (typeof verified !== "boolean") {
      return res
        .status(400)
        .json({ message: "isVerified must be true or false" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isVerified: verified,
        verificationToken: verified ? null : user.verificationToken,
      },
      select: USER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({
        message: "User verification updated successfully",
        user: updatedUser,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to update verification state",
        error: err.message,
      });
  }
};

// PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_USER_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({
          message: "Status must be ACTIVE, INACTIVE, BLOCKED, or DELETED",
        });
    }

    if (req.user.id === id && status === "DELETED") {
      return res
        .status(400)
        .json({ message: "Admin cannot set their own account to DELETED" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: USER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "User status updated successfully", user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user status", error: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(400)
        .json({ message: "Admin cannot delete their own account" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id },
      data: { status: "DELETED" },
    });

    res.status(200).json({ message: "User marked as DELETED successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user status", error: err.message });
  }
};

// GET /api/admin/users/stats/summary
exports.getUserStats = async (_req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalCustomers,
      verifiedUsers,
      unverifiedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isVerified: false } }),
    ]);

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalCustomers,
      verifiedUsers,
      unverifiedUsers,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user stats", error: err.message });
  }
};

// GET /api/admin/dashboard/details
exports.getDashboardDetails = async (_req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingOrders] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
      ]);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to fetch dashboard details",
        error: err.message,
      });
  }
};

// GET /api/admin/categories
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const status = req.query.status;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (!VALID_CATEGORY_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid category status filter" });
      }
      where.isActive = status === "ACTIVE";
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: CATEGORY_SAFE_SELECT,
      }),
      prisma.category.count({ where }),
    ]);

    res.status(200).json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
  }
};

// POST /api/admin/categories
exports.createCategoryAdmin = async (req, res) => {
  try {
    const { name, slug, description, image, status, isFeatured } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const normalizedName = String(name).trim();
    if (normalizedName.length < 2) {
      return res
        .status(400)
        .json({ message: "Category name must be at least 2 characters long" });
    }

    if (status !== undefined && !VALID_CATEGORY_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const uniqueSlug = await buildUniqueCategorySlug(slug || normalizedName);
    if (!uniqueSlug) {
      return res
        .status(400)
        .json({ message: "Unable to generate a valid slug for this category" });
    }

    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        slug: uniqueSlug,
        description: description ? String(description).trim() : null,
        image: image ? String(image).trim() : null,
        isActive: status ? status === "ACTIVE" : true,
        isFeatured: parseBoolean(isFeatured) === true,
      },
      select: CATEGORY_SAFE_SELECT,
    });

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Category name or slug already exists" });
    }

    res
      .status(500)
      .json({ message: "Failed to create category", error: err.message });
  }
};

// GET /api/admin/categories/:id
exports.getCategoryByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      select: CATEGORY_SAFE_SELECT,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch category", error: err.message });
  }
};

// PUT /api/admin/categories/:id
exports.updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, slug, description, image, status, isFeatured } = req.body;
    const data = {};

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (normalizedName.length < 2) {
        return res
          .status(400)
          .json({
            message: "Category name must be at least 2 characters long",
          });
      }
      data.name = normalizedName;
    }

    if (slug !== undefined) {
      const uniqueSlug = await buildUniqueCategorySlug(slug, id);
      if (!uniqueSlug) {
        return res.status(400).json({ message: "Invalid slug value" });
      }
      data.slug = uniqueSlug;
    }

    if (description !== undefined) {
      data.description = description ? String(description).trim() : null;
    }

    if (image !== undefined) {
      data.image = image ? String(image).trim() : null;
    }

    if (status !== undefined) {
      if (!VALID_CATEGORY_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be ACTIVE or INACTIVE" });
      }
      data.isActive = status === "ACTIVE";
    }

    if (isFeatured !== undefined) {
      const parsedFeatured = parseBoolean(isFeatured);
      if (typeof parsedFeatured !== "boolean") {
        return res
          .status(400)
          .json({ message: "isFeatured must be true or false" });
      }
      data.isFeatured = parsedFeatured;
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      select: CATEGORY_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Category name or slug already exists" });
    }

    res
      .status(500)
      .json({ message: "Failed to update category", error: err.message });
  }
};

// PATCH /api/admin/categories/:id/status
exports.updateCategoryStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_CATEGORY_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive: status === "ACTIVE" },
      select: CATEGORY_SAFE_SELECT,
    });

    res
      .status(200)
      .json({
        message: "Category status updated successfully",
        category: updatedCategory,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to update category status",
        error: err.message,
      });
  }
};

// GET /api/admin/categories/options
exports.getAdminCategoryOptions = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        isFeatured: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
  }
};

// GET /api/admin/products
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const status = req.query.status;
    const categoryId = req.query.categoryId;
    const isFeatured = parseBoolean(req.query.isFeatured);
    const sortBy = String(req.query.sortBy || "")
      .trim()
      .toLowerCase();

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (!VALID_PRODUCT_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid product status filter" });
      }
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (typeof isFeatured === "boolean") {
      where.isFeatured = isFeatured;
    }

    if (sortBy && !VALID_PRODUCT_SORTS.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid product sort filter" });
    }

    let products = await prisma.product.findMany({
      where,
      select: PRODUCT_SAFE_SELECT,
    });

    if (sortBy === "stock") {
      products.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
    } else if (sortBy === "discounted_first") {
      products.sort((a, b) => {
        const aDiscounted = getDiscountMetrics(a).hasDiscount;
        const bDiscounted = getDiscountMetrics(b).hasDiscount;

        if (bDiscounted !== aDiscounted) {
          return bDiscounted - aDiscounted;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else if (sortBy === "price") {
      products.sort((a, b) => {
        const aEffective = toSortableNumber(a.salePrice ?? a.price ?? 0);
        const bEffective = toSortableNumber(b.salePrice ?? b.price ?? 0);

        if (aEffective !== bEffective) {
          return aEffective - bEffective;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else if (sortBy === "max_discount_first") {
      products.sort((a, b) => {
        const aDiscount = getDiscountMetrics(a);
        const bDiscount = getDiscountMetrics(b);

        if (bDiscount.hasDiscount !== aDiscount.hasDiscount) {
          return bDiscount.hasDiscount - aDiscount.hasDiscount;
        }

        if (bDiscount.discountAmount !== aDiscount.discountAmount) {
          return bDiscount.discountAmount - aDiscount.discountAmount;
        }

        if (bDiscount.discountPercent !== aDiscount.discountPercent) {
          return bDiscount.discountPercent - aDiscount.discountPercent;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      products.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const total = products.length;
    products = products.slice(skip, skip + limit);

    res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

// POST /api/admin/products
exports.createProductAdmin = async (req, res) => {
  try {
    const {
      name,
      slug,
      productCode,
      description,
      price,
      salePrice,
      discountType,
      stock,
      quantity,
      unit,
      images,
      isFeatured,
      status,
      categoryId,
    } = req.body;

    if (!name || !categoryId || price === undefined) {
      return res
        .status(400)
        .json({ message: "Name, categoryId, and price are required" });
    }

    const normalizedName = String(name).trim();
    if (normalizedName.length < 2) {
      return res
        .status(400)
        .json({ message: "Product name must be at least 2 characters long" });
    }

    const parsedPrice = parseNumber(price);
    if (parsedPrice === null || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

    const parsedSalePrice =
      salePrice === undefined || salePrice === null || salePrice === ""
        ? null
        : parseNumber(salePrice);
    if (
      parsedSalePrice !== null &&
      (parsedSalePrice < 0 || parsedSalePrice > parsedPrice)
    ) {
      return res
        .status(400)
        .json({
          message: "Sale price must be between 0 and the original price",
        });
    }

    const parsedStock =
      stock === undefined || stock === "" ? 0 : parseInteger(stock);
    if (parsedStock === null || parsedStock < 0) {
      return res
        .status(400)
        .json({ message: "Stock must be a valid non-negative integer" });
    }

    const parsedQuantity =
      quantity === undefined || quantity === "" ? 1 : parseInteger(quantity);
    if (parsedQuantity === null || parsedQuantity < 1) {
      return res
        .status(400)
        .json({
          message:
            "Quantity must be a valid integer greater than or equal to 1",
        });
    }

    const normalizedStatus =
      status && VALID_PRODUCT_STATUSES.includes(status) ? status : "ACTIVE";
    if (
      discountType !== undefined &&
      discountType !== null &&
      !VALID_DISCOUNT_TYPES.includes(discountType)
    ) {
      return res
        .status(400)
        .json({ message: "Discount type must be NONE, PERCENTAGE, or FLAT" });
    }

    const normalizedDiscountType =
      discountType && VALID_DISCOUNT_TYPES.includes(discountType)
        ? discountType
        : "NONE";

    if (normalizedDiscountType !== "NONE" && parsedSalePrice === null) {
      return res
        .status(400)
        .json({
          message:
            "Sale price is required when discount type is PERCENTAGE or FLAT",
        });
    }

    const normalizedUnit = String(unit || "kg").trim() || "kg";
    const normalizedProductCode =
      productCode === undefined || productCode === null
        ? null
        : String(productCode).trim() || null;
    const normalizedImages = Array.isArray(images)
      ? images.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    const category = await prisma.category.findUnique({
      where: { id: String(categoryId) },
    });
    if (!category) {
      return res
        .status(400)
        .json({ message: "Selected category does not exist" });
    }

    const uniqueSlug = await buildUniqueProductSlug(slug || normalizedName);
    if (!uniqueSlug) {
      return res
        .status(400)
        .json({ message: "Unable to generate a valid slug for this product" });
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        slug: uniqueSlug,
        productCode: normalizedProductCode,
        description: description ? String(description).trim() : null,
        price: parsedPrice,
        salePrice: normalizedDiscountType === "NONE" ? null : parsedSalePrice,
        discountType: normalizedDiscountType,
        stock: parsedStock,
        quantity: parsedQuantity,
        unit: normalizedUnit,
        images: normalizedImages,
        isFeatured: Boolean(isFeatured),
        status: normalizedStatus,
        categoryId: String(categoryId),
      },
      select: PRODUCT_SAFE_SELECT,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    if (err.code === "P2002") {
      if (
        Array.isArray(err.meta?.target) &&
        err.meta.target.includes("productCode")
      ) {
        return res.status(400).json({ message: "Product code already exists" });
      }
      return res.status(400).json({ message: "Product slug already exists" });
    }

    res
      .status(500)
      .json({ message: "Failed to create product", error: err.message });
  }
};

// GET /api/admin/products/:id
exports.getProductByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: PRODUCT_SAFE_SELECT,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: err.message });
  }
};

// GET /api/admin/products/code/:productCode
exports.getProductByCodeAdmin = async (req, res) => {
  try {
    const productCode = String(req.params.productCode || "").trim();

    if (!productCode) {
      return res.status(400).json({ message: "Product code is required" });
    }

    const product = await prisma.product.findUnique({
      where: { productCode },
      select: PRODUCT_SAFE_SELECT,
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "No product found for this barcode" });
    }

    res.status(200).json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product by code", error: err.message });
  }
};

// PUT /api/admin/products/:id
exports.updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = {};
    const {
      name,
      slug,
      productCode,
      description,
      price,
      salePrice,
      discountType,
      stock,
      quantity,
      unit,
      images,
      isFeatured,
      status,
      categoryId,
    } = req.body;

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (normalizedName.length < 2) {
        return res
          .status(400)
          .json({ message: "Product name must be at least 2 characters long" });
      }
      data.name = normalizedName;
    }

    if (slug !== undefined) {
      const uniqueSlug = await buildUniqueProductSlug(slug, id);
      if (!uniqueSlug) {
        return res.status(400).json({ message: "Invalid slug value" });
      }
      data.slug = uniqueSlug;
    }

    if (description !== undefined) {
      data.description = description ? String(description).trim() : null;
    }

    if (price !== undefined) {
      const parsedPrice = parseNumber(price);
      if (parsedPrice === null || parsedPrice < 0) {
        return res
          .status(400)
          .json({ message: "Price must be a valid positive number" });
      }
      data.price = parsedPrice;
    }

    if (salePrice !== undefined) {
      if (salePrice === null || salePrice === "") {
        data.salePrice = null;
      } else {
        const parsedSalePrice = parseNumber(salePrice);
        if (parsedSalePrice === null || parsedSalePrice < 0) {
          return res
            .status(400)
            .json({
              message: "Sale price must be a valid non-negative number",
            });
        }
        data.salePrice = parsedSalePrice;
      }
    }

    if (stock !== undefined) {
      const parsedStock = parseInteger(stock);
      if (parsedStock === null || parsedStock < 0) {
        return res
          .status(400)
          .json({ message: "Stock must be a valid non-negative integer" });
      }
      data.stock = parsedStock;
    }

    if (quantity !== undefined) {
      const parsedQuantity = parseInteger(quantity);
      if (parsedQuantity === null || parsedQuantity < 1) {
        return res
          .status(400)
          .json({
            message:
              "Quantity must be a valid integer greater than or equal to 1",
          });
      }
      data.quantity = parsedQuantity;
    }

    if (unit !== undefined) {
      data.unit = String(unit || "").trim() || "kg";
    }

    if (productCode !== undefined) {
      const normalizedProductCode = String(productCode || "").trim();
      data.productCode = normalizedProductCode || null;
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res
          .status(400)
          .json({ message: "Images must be an array of URLs" });
      }
      data.images = images
        .map((item) => String(item || "").trim())
        .filter(Boolean);
    }

    if (isFeatured !== undefined) {
      data.isFeatured = Boolean(isFeatured);
    }

    if (status !== undefined) {
      if (!VALID_PRODUCT_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({
            message: "Status must be ACTIVE, INACTIVE, or DISCONTINUED",
          });
      }
      data.status = status;
    }

    if (discountType !== undefined) {
      if (!VALID_DISCOUNT_TYPES.includes(discountType)) {
        return res
          .status(400)
          .json({ message: "Discount type must be NONE, PERCENTAGE, or FLAT" });
      }
      data.discountType = discountType;
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: String(categoryId) },
      });
      if (!category) {
        return res
          .status(400)
          .json({ message: "Selected category does not exist" });
      }
      data.categoryId = String(categoryId);
    }

    const nextPrice =
      data.price !== undefined ? data.price : Number(existingProduct.price);
    const nextSalePrice =
      data.salePrice !== undefined
        ? data.salePrice
        : existingProduct.salePrice === null ||
            existingProduct.salePrice === undefined
          ? null
          : Number(existingProduct.salePrice);
    const nextDiscountType =
      data.discountType !== undefined
        ? data.discountType
        : existingProduct.discountType || "NONE";

    if (nextSalePrice !== null && nextSalePrice > nextPrice) {
      return res
        .status(400)
        .json({
          message:
            "Sale price must be less than or equal to the original price",
        });
    }

    if (nextDiscountType !== "NONE" && nextSalePrice === null) {
      return res
        .status(400)
        .json({
          message:
            "Sale price is required when discount type is PERCENTAGE or FLAT",
        });
    }

    if (nextDiscountType === "NONE") {
      data.salePrice = null;
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      select: PRODUCT_SAFE_SELECT,
    });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    if (err.code === "P2002") {
      if (
        Array.isArray(err.meta?.target) &&
        err.meta.target.includes("productCode")
      ) {
        return res.status(400).json({ message: "Product code already exists" });
      }
      return res.status(400).json({ message: "Product slug already exists" });
    }

    res
      .status(500)
      .json({ message: "Failed to update product", error: err.message });
  }
};

// PATCH /api/admin/products/:id/status
exports.updateProductStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_PRODUCT_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE, INACTIVE, or DISCONTINUED" });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status },
      select: PRODUCT_SAFE_SELECT,
    });

    res
      .status(200)
      .json({
        message: "Product status updated successfully",
        product: updatedProduct,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update product status", error: err.message });
  }
};

// GET /api/admin/products/:id/reviews
exports.getProductReviewsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const status = String(req.query.status || "").trim();
    const search = String(req.query.search || "").trim();

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const where = { productId: id };

    if (status) {
      if (!VALID_REVIEW_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be ACTIVE or INACTIVE" });
      }

      where.isActive = status === "ACTIVE";
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: REVIEW_SAFE_SELECT,
      }),
      prisma.productReview.count({ where }),
    ]);

    res.status(200).json({
      product,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product reviews", error: err.message });
  }
};

// PATCH /api/admin/reviews/:id/status
exports.updateReviewStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_REVIEW_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const updatedReview = await prisma.productReview.update({
      where: { id },
      data: { isActive: status === "ACTIVE" },
      select: REVIEW_SAFE_SELECT,
    });

    res
      .status(200)
      .json({
        message: "Review status updated successfully",
        review: updatedReview,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update review status", error: err.message });
  }
};

// GET /api/admin/hero-sliders
exports.getHeroSlidersAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { subtitle: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (!VALID_HERO_SLIDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be ACTIVE or INACTIVE" });
      }

      where.isActive = status === "ACTIVE";
    }

    const [sliders, total] = await Promise.all([
      prisma.heroSlider.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        select: HERO_SLIDER_SAFE_SELECT,
      }),
      prisma.heroSlider.count({ where }),
    ]);

    res.status(200).json({
      sliders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch hero sliders", error: err.message });
  }
};

// POST /api/admin/hero-sliders
exports.createHeroSliderAdmin = async (req, res) => {
  try {
    const { title, subtitle, image, link, status, priority } = req.body;

    const normalizedImage = String(image || "").trim();
    if (!normalizedImage) {
      return res.status(400).json({ message: "Image is required" });
    }

    const normalizedPriority =
      priority === undefined || priority === "" ? 0 : parseInteger(priority);
    if (normalizedPriority === null || normalizedPriority < 0) {
      return res
        .status(400)
        .json({ message: "Priority must be a non-negative integer" });
    }

    if (
      status !== undefined &&
      status !== "" &&
      !VALID_HERO_SLIDER_STATUSES.includes(status)
    ) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const slider = await prisma.heroSlider.create({
      data: {
        title: title ? String(title).trim() : null,
        subtitle: subtitle ? String(subtitle).trim() : null,
        image: normalizedImage,
        link: link ? String(link).trim() : null,
        isActive: status ? status === "ACTIVE" : true,
        priority: normalizedPriority,
      },
      select: HERO_SLIDER_SAFE_SELECT,
    });

    res
      .status(201)
      .json({ message: "Hero slider created successfully", slider });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create hero slider", error: err.message });
  }
};

// GET /api/admin/hero-sliders/:id
exports.getHeroSliderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await prisma.heroSlider.findUnique({
      where: { id },
      select: HERO_SLIDER_SAFE_SELECT,
    });

    if (!slider) {
      return res.status(404).json({ message: "Hero slider not found" });
    }

    res.status(200).json(slider);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch hero slider", error: err.message });
  }
};

// PUT /api/admin/hero-sliders/:id
exports.updateHeroSliderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const existingSlider = await prisma.heroSlider.findUnique({
      where: { id },
    });
    if (!existingSlider) {
      return res.status(404).json({ message: "Hero slider not found" });
    }

    const { title, subtitle, image, link, status, priority } = req.body;
    const data = {};

    if (title !== undefined) data.title = title ? String(title).trim() : null;
    if (subtitle !== undefined)
      data.subtitle = subtitle ? String(subtitle).trim() : null;
    if (image !== undefined) {
      const normalizedImage = String(image || "").trim();
      if (!normalizedImage) {
        return res.status(400).json({ message: "Image is required" });
      }
      data.image = normalizedImage;
    }
    if (link !== undefined) data.link = link ? String(link).trim() : null;

    if (priority !== undefined) {
      const normalizedPriority = parseInteger(priority);
      if (normalizedPriority === null || normalizedPriority < 0) {
        return res
          .status(400)
          .json({ message: "Priority must be a non-negative integer" });
      }
      data.priority = normalizedPriority;
    }

    if (status !== undefined) {
      if (!VALID_HERO_SLIDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be ACTIVE or INACTIVE" });
      }
      data.isActive = status === "ACTIVE";
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const slider = await prisma.heroSlider.update({
      where: { id },
      data,
      select: HERO_SLIDER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "Hero slider updated successfully", slider });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update hero slider", error: err.message });
  }
};

// PATCH /api/admin/hero-sliders/:id/status
exports.updateHeroSliderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_HERO_SLIDER_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be ACTIVE or INACTIVE" });
    }

    const slider = await prisma.heroSlider.findUnique({ where: { id } });
    if (!slider) {
      return res.status(404).json({ message: "Hero slider not found" });
    }

    const updatedSlider = await prisma.heroSlider.update({
      where: { id },
      data: { isActive: status === "ACTIVE" },
      select: HERO_SLIDER_SAFE_SELECT,
    });

    res
      .status(200)
      .json({
        message: "Hero slider status updated successfully",
        slider: updatedSlider,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to update hero slider status",
        error: err.message,
      });
  }
};

// GET /api/admin/settings
exports.getSiteSettingsAdmin = async (_req, res) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: SITE_SETTINGS_SAFE_SELECT,
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "singleton" },
        select: SITE_SETTINGS_SAFE_SELECT,
      });
    }

    res.status(200).json(settings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch site settings", error: err.message });
  }
};

// PUT /api/admin/settings
exports.updateSiteSettingsAdmin = async (req, res) => {
  try {
    const {
      storeName,
      contactEmail,
      contactPhone,
      deliveryFee,
      minOrderForFreeDelivery,
      isStoreOpen,
      maintenanceMode,
    } = req.body || {};

    const data = {};

    if (storeName !== undefined) {
      const normalizedStoreName = String(storeName).trim();
      if (normalizedStoreName.length < 2) {
        return res
          .status(400)
          .json({ message: "Store name must be at least 2 characters long" });
      }
      data.storeName = normalizedStoreName;
    }

    if (contactEmail !== undefined) {
      const normalizedEmail = String(contactEmail || "").trim();
      if (
        normalizedEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ) {
        return res
          .status(400)
          .json({ message: "Contact email must be a valid email address" });
      }
      data.contactEmail = normalizedEmail || null;
    }

    if (contactPhone !== undefined) {
      const normalizedPhone = String(contactPhone || "").trim();
      data.contactPhone = normalizedPhone || null;
    }

    if (deliveryFee !== undefined) {
      const normalizedDeliveryFee = parseNumber(deliveryFee);
      if (normalizedDeliveryFee === null || normalizedDeliveryFee < 0) {
        return res
          .status(400)
          .json({
            message: "Delivery fee must be a valid non-negative number",
          });
      }
      data.deliveryFee = normalizedDeliveryFee;
    }

    if (minOrderForFreeDelivery !== undefined) {
      const normalizedMinOrder = parseNumber(minOrderForFreeDelivery);
      if (normalizedMinOrder === null || normalizedMinOrder < 0) {
        return res
          .status(400)
          .json({
            message:
              "Minimum order for free delivery must be a valid non-negative number",
          });
      }
      data.minOrderForFreeDelivery = normalizedMinOrder;
    }

    if (isStoreOpen !== undefined) {
      const parsedStoreOpen = parseBoolean(isStoreOpen);
      if (typeof parsedStoreOpen !== "boolean") {
        return res
          .status(400)
          .json({ message: "isStoreOpen must be true or false" });
      }
      data.isStoreOpen = parsedStoreOpen;
    }

    if (maintenanceMode !== undefined) {
      const parsedMaintenanceMode = parseBoolean(maintenanceMode);
      if (typeof parsedMaintenanceMode !== "boolean") {
        return res
          .status(400)
          .json({ message: "maintenanceMode must be true or false" });
      }
      data.maintenanceMode = parsedMaintenanceMode;
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
      select: SITE_SETTINGS_SAFE_SELECT,
    });

    res
      .status(200)
      .json({ message: "Site settings updated successfully", settings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update site settings", error: err.message });
  }
};
