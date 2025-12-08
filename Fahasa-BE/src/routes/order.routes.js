const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Apply optional auth to all order routes
router.use(optionalAuth);

// Create order from cart
router.post('/', OrderController.createOrder);

// Get all orders for customer
router.get('/', OrderController.getOrders);

// Get order by ID
router.get('/:orderId', OrderController.getOrderById);

// Cancel order
router.put('/:orderId/cancel', OrderController.cancelOrder);

module.exports = router;
