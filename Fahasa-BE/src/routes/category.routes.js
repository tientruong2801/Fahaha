const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');

// Get all categories
router.get('/', CategoryController.getAll);

// Get category by ID
router.get('/:id', CategoryController.getById);

// Get products by category
router.get('/:id/products', CategoryController.getProducts);

module.exports = router;
