const { sql } = require('../config/database');
const db = require('../config/database');

class Product {
    constructor(product) {
        this.product_id = product.product_id;
        this.title = product.title;
        this.publisher = product.publisher;
        this.supplier = product.supplier;
        this.description = product.description;
        this.year = product.year;
        this.language = product.language;
        this.product_type = product.product_type;
        this.stock_quantity = product.stock_quantity;
        this.price = product.price;
        this.weight = product.weight;
        this.size = product.size;
    }

    // Lấy tất cả sản phẩm với phân trang, tìm kiếm và lọc theo category
    static async getAll(page = 1, limit = 10, search = '', categoryId = null) {
        try {
            const pool = await db.getConnection();
            const offset = (page - 1) * limit;

            let query = `
        SELECT DISTINCT
          p.product_id,
          p.title,
          p.publisher,
          p.supplier,
          p.description,
          p.year,
          p.language,
          p.product_type,
          p.stock_quantity,
          p.price,
          p.weight,
          p.size,
          COALESCE(
            (
              SELECT STRING_AGG(c.category_name, ', ') 
              FROM Category_Product cp
              INNER JOIN Category c ON cp.category_id = c.category_id
              WHERE cp.product_id = p.product_id
            ),
            N'Khác'
          ) as categories
        FROM Product p
      `;

            // Add category filter if provided
            if (categoryId) {
                query += ` INNER JOIN Category_Product cp ON p.product_id = cp.product_id`;
            }

            let whereConditions = [];

            if (search) {
                whereConditions.push(`(p.title LIKE @search OR p.publisher LIKE @search OR p.supplier LIKE @search)`);
            }

            if (categoryId) {
                whereConditions.push(`cp.category_id = @categoryId`);
            }

            if (whereConditions.length > 0) {
                query += ` WHERE ` + whereConditions.join(' AND ');
            }

            query += `
        ORDER BY p.product_id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

            const request = pool.request();
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limit);

            if (search) {
                request.input('search', sql.NVarChar, `%${search}%`);
            }

            if (categoryId) {
                request.input('categoryId', sql.Int, parseInt(categoryId));
            }

            const result = await request.query(query);

            // Đếm tổng số sản phẩm
            let countQuery = `SELECT COUNT(DISTINCT p.product_id) as total FROM Product p`;

            if (categoryId) {
                countQuery += ` INNER JOIN Category_Product cp ON p.product_id = cp.product_id`;
            }

            let countWhereConditions = [];
            if (search) {
                countWhereConditions.push(`(p.title LIKE @search OR p.publisher LIKE @search OR p.supplier LIKE @search)`);
            }
            if (categoryId) {
                countWhereConditions.push(`cp.category_id = @categoryId`);
            }

            if (countWhereConditions.length > 0) {
                countQuery += ` WHERE ` + countWhereConditions.join(' AND ');
            }

            const countRequest = pool.request();
            if (search) {
                countRequest.input('search', sql.NVarChar, `%${search}%`);
            }
            if (categoryId) {
                countRequest.input('categoryId', sql.Int, parseInt(categoryId));
            }

            const countResult = await countRequest.query(countQuery);
            const total = countResult.recordset[0].total;

            return {
                data: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    static async getById(id) {
        try {
            const pool = await db.getConnection();

            const query = `
        SELECT 
          p.product_id,
          p.title,
          p.publisher,
          p.supplier,
          p.description,
          p.year,
          p.language,
          p.product_type,
          p.stock_quantity,
          p.price,
          p.weight,
          p.size,
          COALESCE(
            (
              SELECT STRING_AGG(c.category_name, ', ') 
              FROM Category_Product cp
              INNER JOIN Category c ON cp.category_id = c.category_id
              WHERE cp.product_id = p.product_id
            ),
            N'Khác'
          ) as categories
        FROM Product p
        WHERE p.product_id = @id
      `;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(query);

            if (result.recordset.length === 0) {
                return null;
            }

            const product = result.recordset[0];

            // Lấy tác giả
            const authorsResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT author_name FROM Author_of_product WHERE product_id = @id');

            product.authors = authorsResult.recordset.map(a => a.author_name);

            // Lấy hình ảnh
            const imagesResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT image_url, ordinal_number FROM Product_Image WHERE product_id = @id ORDER BY ordinal_number');

            product.images = imagesResult.recordset.map(i => i.image_url);

            return product;
        } catch (error) {
            throw error;
        }
    }

    // Tạo sản phẩm mới (sử dụng stored procedure)
    static async create(productData) {
        try {
            const pool = await db.getConnection();
            const request = pool.request();

            // Map tham số từ FE xuống SP
            request.input('Title', sql.NVarChar, productData.title);
            request.input('Publisher', sql.NVarChar, productData.publisher);
            request.input('Supplier', sql.NVarChar, productData.supplier || null);
            request.input('Description', sql.NVarChar, productData.description || null);
            request.input('Year', sql.Int, productData.year || null);
            request.input('Language', sql.NVarChar, productData.language || null);
            request.input('ProductType', sql.NVarChar, productData.product_type || null);
            request.input('StockQuantity', sql.Int, productData.stock_quantity);
            request.input('Price', sql.Decimal(12, 2), productData.price);
            request.input('Weight', sql.Decimal(10, 2), productData.weight || null);
            request.input('Size', sql.VarChar(2), productData.size || null);

            await request.execute('sp_InsertProduct');

            return { message: 'Product created successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm (sử dụng stored procedure)
    static async update(id, productData) {
        try {
            const pool = await db.getConnection();
            const request = pool.request();

            request.input('ProductID', sql.Int, id);
            request.input('Title', sql.NVarChar, productData.title);
            request.input('Publisher', sql.NVarChar, productData.publisher);
            request.input('Supplier', sql.NVarChar, productData.supplier || null);
            request.input('Description', sql.NVarChar, productData.description || null);
            request.input('Year', sql.Int, productData.year || null);
            request.input('Language', sql.NVarChar, productData.language || null);
            request.input('ProductType', sql.NVarChar, productData.product_type || null);
            request.input('StockQuantity', sql.Int, productData.stock_quantity);
            request.input('Price', sql.Decimal(12, 2), productData.price);
            request.input('Weight', sql.Decimal(10, 2), productData.weight || null);
            request.input('Size', sql.VarChar(2), productData.size || null);

            await request.execute('sp_UpdateProduct');

            return await this.getById(id);
        } catch (error) {
            throw error;
        }
    }

    // Xóa sản phẩm (sử dụng stored procedure)
    static async delete(id) {
        try {
            const pool = await db.getConnection();

            // Kiểm tra sản phẩm tồn tại
            const checkProduct = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT product_id FROM Product WHERE product_id = @id');

            if (checkProduct.recordset.length === 0) {
                throw new Error('Sản phẩm không tồn tại');
            }

            // Kiểm tra sản phẩm có trong đơn hàng không
            const checkOrder = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT 1 FROM Order_Product WHERE product_id = @id');

            if (checkOrder.recordset.length > 0) {
                throw new Error('Không thể xóa sản phẩm vì đã có đơn hàng liên quan. Sản phẩm này đã được bán.');
            }

            // Kiểm tra sản phẩm có trong giỏ hàng không
            const checkCart = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT 1 FROM Cart_Product WHERE product_id = @id');

            if (checkCart.recordset.length > 0) {
                throw new Error('Không thể xóa sản phẩm vì có trong giỏ hàng.');
            }

            // Kiểm tra sản phẩm có trong flash sale không
            const checkFlashSale = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT 1 FROM Flashsale_Product WHERE product_id = @id');

            if (checkFlashSale.recordset.length > 0) {
                throw new Error('Không thể xóa sản phẩm vì có trong chương trình flash sale.');
            }

            // Xóa các bảng liên quan
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Product_Image WHERE product_id = @id');

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ProductReview WHERE product_id = @id');

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Author_of_product WHERE product_id = @id');

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Category_Product WHERE product_id = @id');

            // Xóa sản phẩm
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Product WHERE product_id = @id');

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Product;
