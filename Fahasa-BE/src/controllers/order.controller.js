const OrderService = require('../services/order.service');
const response = require('../utils/response');

class OrderController {
    // Create order from cart
    static async createOrder(req, res) {
        try {
            const userId = (req.user && req.user.userId) || req.body.userId || 101;
            const orderData = {
                payment_method: req.body.payment_method || 'COD',
                shipping_fee: req.body.shipping_fee,
                note: req.body.note,
                point_used: req.body.point_used || 0
            };

            console.log('📦 Creating order:', { userId, orderData });

            const result = await OrderService.createOrder(userId, orderData);

            if (!result.success) {
                return response.error(res, result.message, 400);
            }

            return response.success(res, result.data, result.message, 201);
        } catch (error) {
            console.error('❌ Error in OrderController.createOrder:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Get order by ID
    static async getOrderById(req, res) {
        try {
            const userId = (req.user && req.user.userId) || req.query.userId || 101;
            const orderId = parseInt(req.params.orderId);

            if (!orderId) {
                return response.error(res, 'orderId is required', 400);
            }

            const result = await OrderService.getOrderById(orderId, userId);

            if (!result.success) {
                return response.error(res, result.message, 404);
            }

            return response.success(res, result.data, 'Order retrieved successfully');
        } catch (error) {
            console.error('Error in OrderController.getOrderById:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Get all orders for customer
    static async getOrders(req, res) {
        try {
            const userId = (req.user && req.user.userId) || req.query.userId || 101;

            const result = await OrderService.getOrders(userId);

            return response.success(res, result.data, 'Orders retrieved successfully');
        } catch (error) {
            console.error('Error in OrderController.getOrders:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Cancel order
    static async cancelOrder(req, res) {
        try {
            const userId = (req.user && req.user.userId) || (req.body && req.body.userId) || 101;
            const orderId = parseInt(req.params.orderId);

            if (!orderId) {
                return response.error(res, 'orderId is required', 400);
            }

            const result = await OrderService.cancelOrder(orderId, userId);

            if (!result.success) {
                return response.error(res, result.message, 400);
            }

            return response.success(res, null, result.message);
        } catch (error) {
            console.error('Error in OrderController.cancelOrder:', error);
            return response.error(res, error.message, 500);
        }
    }
}

module.exports = OrderController;
