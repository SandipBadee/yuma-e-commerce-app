const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
	getAllProducts,
	getProductBySlug,
	getProductReviewsBySlug,
	createProductReviewBySlug
} = require('../controllers/productController');

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Public product catalog and review endpoints
 */

// PUBLIC: Anyone can browse the groceries

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get public products with pagination and optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name, description, or slug.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug.
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Failed to fetch products
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{slug}/reviews:
 *   get:
 *     summary: Get active reviews for a product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Product reviews fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to fetch product reviews
 */
router.get('/:slug/reviews', getProductReviewsBySlug);

/**
 * @swagger
 * /api/products/{slug}/reviews:
 *   post:
 *     summary: Create a review for a product by slug
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Invalid payload or duplicate review
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to add review
 */
router.post('/:slug/reviews', verifyToken, createProductReviewBySlug);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Get a single active product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Product slug is required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to fetch product
 */
router.get('/:slug', getProductBySlug);

module.exports = router;