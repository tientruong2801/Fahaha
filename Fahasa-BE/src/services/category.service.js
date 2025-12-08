const CategoryModel = require('../models/category.model');

class CategoryService {
    // Get all categories
    static async getAllCategories() {
        try {
            const categories = await CategoryModel.getAll();
            return categories;
        } catch (error) {
            throw error;
        }
    }

    // Get category by ID
    static async getCategoryById(categoryId) {
        try {
            const category = await CategoryModel.getById(categoryId);
            return category;
        } catch (error) {
            throw error;
        }
    }

    // Get products by category
    static async getCategoryProducts(categoryId, page = 1, limit = 20) {
        try {
            const result = await CategoryModel.getProducts(categoryId, page, limit);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CategoryService;
