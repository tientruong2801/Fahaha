const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authenticateToken, authController.verifyToken);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
