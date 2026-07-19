const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin-only user management endpoints
 */

// Every admin route below requires a valid token and ADMIN role.
router.use(verifyToken, isAdmin);

/**
 * @swagger
 * /api/admin/dashboard/details:
 *   get:
 *     summary: Get admin dashboard details
 *     description: Returns total users now, and placeholder values for products/orders until related schemas are available.
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Dashboard details fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/dashboard/details', adminController.getDashboardDetails);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (default 10, max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user email or name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED, DELETED]
 *         description: Filter by user account status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLOCKED, DELETED]
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.post('/users', adminController.createUser);

/**
 * @swagger
 * /api/admin/users/stats/summary:
 *   get:
 *     summary: Get user statistics summary
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: User statistics fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/users/stats/summary', adminController.getUserStats);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER]
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid update payload
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   patch:
 *     summary: Update user verification status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isVerified]
 *             properties:
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Verification state updated successfully
 *       400:
 *         description: Invalid verification payload
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/verify', adminController.setUserVerification);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLOCKED, DELETED]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status payload
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Mark a user account as DELETED
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID)
 *     responses:
 *       200:
 *         description: User marked as DELETED successfully
 *       400:
 *         description: Invalid delete request
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: URL-friendly slug (auto-generated if not provided)
 *               description:
 *                 type: string
 *                 description: Category description
 *               image:
 *                 type: string
 *                 description: Category image URL
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Category ID (UUID)
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid payload or name is required
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/categories', adminController.getAllCategoriesAdmin);
router.post('/categories', adminController.createCategoryAdmin);

/**
 * @swagger
 * /api/admin/categories/options:
 *   get:
 *     summary: Get category options for product forms
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Category options fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/categories/options', adminController.getAdminCategoryOptions);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *   put:
 *     summary: Update category
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 */
router.get('/categories/:id', adminController.getCategoryByIdAdmin);
router.put('/categories/:id', adminController.updateCategoryAdmin);

/**
 * @swagger
 * /api/admin/categories/{id}/status:
 *   patch:
 *     summary: Update category status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 */
router.patch('/categories/:id/status', adminController.updateCategoryStatusAdmin);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId, price]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name (required)
 *               slug:
 *                 type: string
 *                 description: URL-friendly slug (auto-generated if not provided)
 *               productCode:
 *                 type: string
 *                 description: Unique product code/barcode
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price (required)
 *               stock:
 *                 type: integer
 *                 description: Available stock quantity
 *                 default: 0
 *               quantity:
 *                 type: integer
 *                 description: Package quantity
 *               unit:
 *                 type: string
 *                 description: Unit of measurement (e.g., kg, liters, pieces)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               isFeatured:
 *                 type: boolean
 *                 description: Mark product as featured
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *                 default: ACTIVE
 *               categoryId:
 *                 type: string
 *                 description: Category ID (UUID) - required
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 productCode:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoryId:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid payload or missing required fields
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/products', adminController.getAllProductsAdmin);
router.post('/products', adminController.createProductAdmin);
router.get('/products/code/:productCode', adminController.getProductByCodeAdmin);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update product
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/products/:id', adminController.getProductByIdAdmin);
router.put('/products/:id', adminController.updateProductAdmin);

/**
 * @swagger
 * /api/admin/products/{id}/reviews:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product reviews fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/products/:id/reviews', adminController.getProductReviewsAdmin);

/**
 * @swagger
 * /api/admin/products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch('/products/:id/status', adminController.updateProductStatusAdmin);

/**
 * @swagger
 * /api/admin/reviews/{id}/status:
 *   patch:
 *     summary: Update review active status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Review status updated successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch('/reviews/:id/status', adminController.updateReviewStatusAdmin);

/**
 * @swagger
 * /api/admin/hero-sliders:
 *   get:
 *     summary: Get hero sliders with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Hero sliders fetched successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new hero slider
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, imageUrl]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Slider title (required)
 *               imageUrl:
 *                 type: string
 *                 description: Image URL for the slider (required)
 *               description:
 *                 type: string
 *                 description: Slider description or caption
 *               link:
 *                 type: string
 *                 description: Link URL when slider is clicked
 *               order:
 *                 type: integer
 *                 description: Display order
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Hero slider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 description:
 *                   type: string
 *                 link:
 *                   type: string
 *                 order:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid payload or missing required fields
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/hero-sliders', adminController.getHeroSlidersAdmin);
router.post('/hero-sliders', adminController.createHeroSliderAdmin);

/**
 * @swagger
 * /api/admin/hero-sliders/{id}:
 *   get:
 *     summary: Get hero slider by ID
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *   put:
 *     summary: Update hero slider
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 */
router.get('/hero-sliders/:id', adminController.getHeroSliderByIdAdmin);
router.put('/hero-sliders/:id', adminController.updateHeroSliderAdmin);

/**
 * @swagger
 * /api/admin/hero-sliders/{id}/status:
 *   patch:
 *     summary: Update hero slider status
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 */
router.patch('/hero-sliders/:id/status', adminController.updateHeroSliderStatusAdmin);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get site settings singleton
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Site settings fetched successfully
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update site settings singleton
 *     tags: [Admin]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 nullable: true
 *               contactPhone:
 *                 type: string
 *                 nullable: true
 *               deliveryFee:
 *                 type: number
 *               minOrderForFreeDelivery:
 *                 type: number
 *               isStoreOpen:
 *                 type: boolean
 *               maintenanceMode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Site settings updated successfully
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */
router.get('/settings', adminController.getSiteSettingsAdmin);
router.put('/settings', adminController.updateSiteSettingsAdmin);

module.exports = router;