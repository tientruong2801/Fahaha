const CartService = require('../services/cart.service');
const response = require('../utils/response');

class CartController {
    // Get user's cart
    static async getCart(req, res) {
        try {
            // Get userId from authenticated user or default to 101
            const userId = (req.user && req.user.user_id) || req.query.userId || 101;

            const result = await CartService.getCart(userId);
            return response.success(res, result.data, 'Cart retrieved successfully');
        } catch (error) {
            console.error('Error in CartController.getCart:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Add product to cart
    static async addToCart(req, res) {
        try {
            const userId = (req.user && req.user.user_id) || req.body.userId || 101;
            const { productId, quantity } = req.body;

            console.log('📦 Add to cart request:', { userId, productId, quantity });

            if (!productId) {
                return response.error(res, 'productId is required', 400);
            }

            const result = await CartService.addToCart(userId, productId, quantity || 1);

            if (!result.success) {
                return response.error(res, result.message, 400);
            }

            return response.success(res, result.data, result.message);
        } catch (error) {
            console.error('❌ Error in CartController.addToCart:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                name: error.name,
                stack: error.stack
            });
            return response.error(res, error.message, 500);
        }
    }

    // Remove product from cart
    static async removeFromCart(req, res) {
        try {
            console.log('🗑️ removeFromCart called');
            console.log('🗑️ req.params:', req.params);
            console.log('🗑️ req.user:', req.user);
            console.log('🗑️ typeof req.user:', typeof req.user);

            const { productId } = req.params;

            // Safe userId extraction
            let userId = 101; // default
            if (req.user && typeof req.user === 'object' && req.user.user_id) {
                userId = req.user.user_id;
            } else if (req.body && req.body.userId) {
                userId = req.body.userId;
            } else if (req.query && req.query.userId) {
                userId = req.query.userId;
            }

            console.log('🗑️ Using userId:', userId);

            if (!productId) {
                return response.error(res, 'productId is required', 400);
            }

            const result = await CartService.removeFromCart(userId, productId);
            return response.success(res, null, result.message);
        } catch (error) {
            console.error('❌ Error in CartController.removeFromCart:', error);
            console.error('❌ Error stack:', error.stack);
            return response.error(res, error.message, 500);
        }
    }

    // Update product quantity
    static async updateQuantity(req, res) {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;
            const userId = (req.user && req.user.user_id) || req.body.userId || 101;

            if (!productId || quantity === undefined) {
                return response.error(res, 'productId and quantity are required', 400);
            }

            const result = await CartService.updateQuantity(userId, productId, quantity);

            if (!result.success) {
                return response.error(res, result.message, 400);
            }

            return response.success(res, result.data, result.message);
        } catch (error) {
            console.error('Error in CartController.updateQuantity:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Clear cart
    static async clearCart(req, res) {
        try {
            const userId = (req.user && req.user.user_id) || req.body.userId || req.query.userId || 101;

            const result = await CartService.clearCart(userId);
            return response.success(res, null, result.message);
        } catch (error) {
            console.error('Error in CartController.clearCart:', error);
            return response.error(res, error.message, 500);
        }
    }
}

module.exports = CartController;
