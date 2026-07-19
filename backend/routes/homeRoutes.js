const express = require('express');
const router = express.Router();

const { getHomeData } = require('../controllers/homeController');

/**
 * @swagger
 * tags:
 *   - name: Home
 *     description: Public storefront home endpoints
 */

/**
 * @swagger
 * /api/home:
 *   get:
 *     summary: Get all storefront home data in one request
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Home data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 heroSlides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                         nullable: true
 *                       subtitle:
 *                         type: string
 *                         nullable: true
 *                       image:
 *                         type: string
 *                       link:
 *                         type: string
 *                         nullable: true
 *                       priority:
 *                         type: integer
 *                 popularCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       image:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       isFeatured:
 *                         type: boolean
 *                 discountedProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 featuredProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 newItems:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */

// Public home endpoint used by storefront landing page.
router.get('/', getHomeData);

module.exports = router;
