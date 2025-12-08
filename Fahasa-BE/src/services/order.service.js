const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');

class OrderService {
    // Create order from cart
    static async createOrder(userId, orderData) {
        try {
            // Get cart items
            const cartItems = await CartModel.getCartByUserId(userId);

            if (!cartItems || cartItems.length === 0) {
                return {
                    success: false,
                    message: 'Cart is empty'
                };
            }

            // Check stock availability
            for (const item of cartItems) {
                if (item.quantity > item.stock_quantity) {
                    return {
                        success: false,
                        message: `Insufficient stock for product: ${item.product_name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}`
                    };
                }
            }

            // Calculate subtotal
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Prepare order data
            const orderPayload = {
                payment_method: orderData.payment_method || 'COD',
                shipping_fee: orderData.shipping_fee || 30000, // Default shipping fee
                note: orderData.note || null,
                point_used: orderData.point_used || 0,
                subtotal: subtotal,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
            };

            // Create order
            const order = await OrderModel.createOrder(userId, orderPayload);

            return {
                success: true,
                data: order,
                message: 'Order created successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Get order details
    static async getOrderById(orderId, userId) {
        try {
            const order = await OrderModel.getOrderById(orderId, userId);

            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            throw error;
        }
    }

    // Get all orders for a customer
    static async getOrders(userId) {
        try {
            const orders = await OrderModel.getOrdersByCustomerId(userId);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            throw error;
        }
    }

    // Cancel order
    static async cancelOrder(orderId, userId) {
        try {
            const result = await OrderModel.updateOrderStatus(orderId, userId, 'Cancelled');

            if (!result) {
                return {
                    success: false,
                    message: 'Order not found or cannot be cancelled'
                };
            }

            return {
                success: true,
                message: 'Order cancelled successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderService;
