const Product = require('../models/product.model');

class ProductService {
    // Lấy danh sách sản phẩm
    async getAllProducts(page, limit, search, categoryId = null) {
        try {
            return await Product.getAll(page, limit, search, categoryId);
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    async getProductById(id) {
        try {
            const product = await Product.getById(id);
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw error;
        }
    }

    // Tạo sản phẩm mới
    async createProduct(productData) {
        try {
            // Validate dữ liệu
            if (!productData.title || !productData.publisher) {
                throw new Error('Title and publisher are required');
            }
            if (productData.price < 0) {
                throw new Error('Price must be greater than or equal to 0');
            }
            if (productData.stock_quantity < 0) {
                throw new Error('Stock quantity must be greater than or equal to 0');
            }

            return await Product.create(productData);
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm
    async updateProduct(id, productData) {
        try {
            // Kiểm tra sản phẩm tồn tại
            const existingProduct = await Product.getById(id);
            if (!existingProduct) {
                throw new Error('Product not found');
            }

            // Validate dữ liệu
            if (productData.price && productData.price < 0) {
                throw new Error('Price must be greater than or equal to 0');
            }
            if (productData.stock_quantity && productData.stock_quantity < 0) {
                throw new Error('Stock quantity must be greater than or equal to 0');
            }

            return await Product.update(id, productData);
        } catch (error) {
            throw error;
        }
    }

    // Xóa sản phẩm
    async deleteProduct(id) {
        try {
            // Kiểm tra sản phẩm tồn tại
            const existingProduct = await Product.getById(id);
            if (!existingProduct) {
                throw new Error('Product not found');
            }

            const deleted = await Product.delete(id);
            if (!deleted) {
                throw new Error('Failed to delete product');
            }
            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProductService();
