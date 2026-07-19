const express = require('express');

const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
	getCheckoutSummary,
	createOrder,
	getMyOrderByNumber,
	getMyOrders,
	getAdminOrders,
	getAdminOrderById,
	updateOrderStatusAdmin
} = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Checkout pricing and order creation endpoints
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/orders/checkout-summary:
 *   post:
 *     summary: Calculate authoritative checkout totals
 *     description: Recalculates item prices from backend product data and applies delivery rules from site settings.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [PICKUP, DELIVERY]
 *                 example: DELIVERY
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 2b7b4579-2f39-4fd6-83fd-e307ecf8f37d
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *     responses:
 *       200:
 *         description: Checkout summary calculated
 *       400:
 *         description: Invalid payload or unavailable product/stock
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/checkout-summary', getCheckoutSummary);

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Get orders for admin management
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, READY_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number or customer fields.
 *     responses:
 *       200:
 *         description: Admin orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/admin', isAdmin, getAdminOrders);

/**
 * @swagger
 * /api/orders/admin/{id}:
 *   get:
 *     summary: Get a single order by internal id for admin
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin order fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/admin/:id', isAdmin, getAdminOrderById);

/**
 * @swagger
 * /api/orders/admin/{id}/status:
 *   patch:
 *     summary: Update order status as admin
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *                 enum: [PENDING, PROCESSING, READY_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/admin/:id/status', isAdmin, updateOrderStatusAdmin);

/**
 * @swagger
 * /api/orders/mine:
 *   get:
 *     summary: Get recent orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 25
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/mine', getMyOrders);

/**
 * @swagger
 * /api/orders/{orderNumber}:
 *   get:
 *     summary: Get a single order by order number for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:orderNumber', getMyOrderByNumber);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Recalculates totals in backend, validates customer fields, saves order and order items, and triggers confirmation email.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, customer]
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [PICKUP, DELIVERY]
 *                 example: PICKUP
 *               scheduleType:
 *                 type: string
 *                 enum: [asap, scheduled]
 *                 example: asap
 *               scheduledAt:
 *                 type: string
 *                 nullable: true
 *                 example: 2026-04-06T14:30
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 2b7b4579-2f39-4fd6-83fd-e307ecf8f37d
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *               customer:
 *                 type: object
 *                 required: [firstName, lastName, email, phone]
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: John
 *                   lastName:
 *                     type: string
 *                     example: Doe
 *                   email:
 *                     type: string
 *                     example: john@example.com
 *                   phone:
 *                     type: string
 *                     example: +358 40 123 4567
 *                   addressLine1:
 *                     type: string
 *                     example: Mannerheimintie 10
 *                   addressLine2:
 *                     type: string
 *                     example: A 12
 *                   postalCode:
 *                     type: string
 *                     example: 00100
 *                   city:
 *                     type: string
 *                     example: Helsinki
 *                   country:
 *                     type: string
 *                     example: Finland
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation failed or stock unavailable
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Order number conflict
 *       500:
 *         description: Server error
 */
router.post('/', createOrder);

module.exports = router;
