const CartModel = require('../models/cart.model');

class CartService {
    // Get user's cart
    static async getCart(userId) {
        try {
            const cartItems = await CartModel.getCartByUserId(userId);
            return {
                success: true,
                data: cartItems
            };
        } catch (error) {
            throw error;
        }
    }

    // Add product to cart
    static async addToCart(userId, productId, quantity = 1) {
        try {
            if (quantity <= 0) {
                return {
                    success: false,
                    message: 'Quantity must be greater than 0'
                };
            }

            const result = await CartModel.addProduct(userId, productId, quantity);
            return {
                success: true,
                data: result,
                message: 'Product added to cart successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Remove product from cart
    static async removeFromCart(userId, productId) {
        try {
            await CartModel.removeProduct(userId, productId);
            return {
                success: true,
                message: 'Product removed from cart successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Update product quantity
    static async updateQuantity(userId, productId, quantity) {
        try {
            if (quantity < 0) {
                return {
                    success: false,
                    message: 'Quantity cannot be negative'
                };
            }

            const result = await CartModel.updateQuantity(userId, productId, quantity);
            return {
                success: true,
                data: result,
                message: 'Cart updated successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Clear cart
    static async clearCart(userId) {
        try {
            await CartModel.clearCart(userId);
            return {
                success: true,
                message: 'Cart cleared successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CartService;
