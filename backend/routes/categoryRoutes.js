const express = require('express');
const router = express.Router();

const {
	getActiveCategories,
	getCategoryBySlugWithProducts
} = require('../controllers/categoryController');

/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Public category browsing endpoints
 */

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all active categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       500:
 *         description: Server error
 */

router.get('/', getActiveCategories);

/**
 * @swagger
 * /api/category/{slug}:
 *   get:
 *     summary: Get category details and paginated products by category slug
 *     tags: [Category]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popular, latest, price-low, price-high]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Category products fetched successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', getCategoryBySlugWithProducts);

module.exports = router;
