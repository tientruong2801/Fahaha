const productService = require('../services/product.service');
const response = require('../utils/response');

class ProductController {
    // GET /api/products - Lấy danh sách sản phẩm
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', categoryId = null } = req.query;
            console.log('Get all products with params:', { page, limit, search, categoryId });
            const result = await productService.getAllProducts(
                parseInt(page),
                parseInt(limit),
                search,
                categoryId
            );

            // Trả về format phù hợp với frontend
            return res.json({
                success: true,
                message: 'Products retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getAll:', error);
            return response.error(res, error.message, 500);
        }
    }

    // GET /api/products/:id - Lấy sản phẩm theo ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);

            return response.success(res, product, 'Product retrieved successfully');
        } catch (error) {
            console.error('Error in getById:', error);
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            return response.error(res, error.message, statusCode);
        }
    }

    // POST /api/products - Tạo sản phẩm mới
    async create(req, res) {
        try {
            const productData = req.body;
            const product = await productService.createProduct(productData);

            return response.success(res, product, 'Product created successfully', 201);
        } catch (error) {
            console.error('Error in create:', error);
            return response.error(res, error.message, 400);
        }
    }

    // PUT /api/products/:id - Cập nhật sản phẩm
    async update(req, res) {
        try {
            const { id } = req.params;
            const productData = req.body;

            const product = await productService.updateProduct(id, productData);

            return response.success(res, product, 'Product updated successfully');
        } catch (error) {
            console.error('Error in update:', error);
            const statusCode = error.message === 'Product not found' ? 404 : 400;
            return response.error(res, error.message, statusCode);
        }
    }

    // DELETE /api/products/:id - Xóa sản phẩm
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await productService.deleteProduct(id);

            return response.success(res, result, 'Product deleted successfully');
        } catch (error) {
            console.error('Error in delete:', error);
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            return response.error(res, error.message, statusCode);
        }
    }
}

module.exports = new ProductController();
