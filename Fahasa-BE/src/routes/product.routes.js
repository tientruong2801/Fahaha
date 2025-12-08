const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm (có phân trang và tìm kiếm)
 * @query   page - Trang hiện tại (mặc định: 1)
 * @query   limit - Số sản phẩm mỗi trang (mặc định: 10)
 * @query   search - Từ khóa tìm kiếm (tìm theo title, publisher, supplier)
 * @access  Public
 */
router.get('/', productController.getAll);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy chi tiết sản phẩm theo ID
 * @param   id - Product ID
 * @access  Public
 */
router.get('/:id', productController.getById);

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 * @body    {
 *            title: string (required),
 *            publisher: string (required),
 *            supplier: string,
 *            description: string,
 *            year: number,
 *            language: string,
 *            product_type: string,
 *            stock_quantity: number (required),
 *            price: number (required),
 *            weight: number,
 *            size: string,
 *            authors: string[],
 *            images: string[]
 *          }
 * @access  Admin (TODO: Thêm middleware auth)
 */
router.post('/', productController.create);

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm
 * @param   id - Product ID
 * @body    Các trường cần cập nhật (tương tự POST)
 * @access  Admin (TODO: Thêm middleware auth)
 */
router.put('/:id', productController.update);

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 * @param   id - Product ID
 * @access  Admin (TODO: Thêm middleware auth)
 */
router.delete('/:id', productController.delete);

module.exports = router;
