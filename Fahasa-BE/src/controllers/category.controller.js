const CategoryService = require('../services/category.service');
const response = require('../utils/response');

class CategoryController {
    // Get all categories
    static async getAll(req, res) {
        try {
            const categories = await CategoryService.getAllCategories();
            return res.json({
                success: true,
                message: 'Categories retrieved successfully',
                data: categories
            });
        } catch (error) {
            console.error('Error in CategoryController.getAll:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Get category by ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.getCategoryById(id);

            if (!category) {
                return response.error(res, 'Category not found', 404);
            }

            return response.success(res, category, 'Category retrieved successfully');
        } catch (error) {
            console.error('Error in CategoryController.getById:', error);
            return response.error(res, error.message, 500);
        }
    }

    // Get products by category
    static async getProducts(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const result = await CategoryService.getCategoryProducts(id, page, limit);

            return res.json({
                success: true,
                message: 'Category products retrieved successfully',
                data: result.data || result,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in CategoryController.getProducts:', error);
            return response.error(res, error.message, 500);
        }
    }
}

module.exports = CategoryController;
