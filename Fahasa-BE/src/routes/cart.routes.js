const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// Apply optional auth to all cart routes
router.use(optionalAuth);

// Get cart
router.get('/', CartController.getCart);

// Add to cart
router.post('/add', CartController.addToCart);

// Clear cart - must be before /:productId to avoid route conflict
router.delete('/clear', CartController.clearCart);

// Remove from cart
router.delete('/:productId', CartController.removeFromCart);

// Update quantity
router.put('/:productId', CartController.updateQuantity);

module.exports = router;
