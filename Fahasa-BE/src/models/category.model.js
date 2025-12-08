const { getConnection, sql } = require('../config/database');

class CategoryModel {
  // Get all categories
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT category_id, category_name, description
      FROM Category
      ORDER BY category_name
    `);
    return result.recordset;
  }

  // Get category by ID
  static async getById(categoryId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('category_id', sql.Int, categoryId)
      .query(`
        SELECT category_id, category_name, description
        FROM Category
        WHERE category_id = @category_id
      `);
    return result.recordset[0];
  }

  // Get products by category
  static async getProducts(categoryId, page = 1, limit = 20) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('category_id', sql.Int, categoryId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT 
          p.product_id,
          p.title,
          p.price,
          p.stock_quantity,
          p.publisher,
          p.description
        FROM Product p
        INNER JOIN Category_Product cp ON p.product_id = cp.product_id
        WHERE cp.category_id = @category_id
        ORDER BY p.product_id DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    // Get total count
    const countResult = await pool.request()
      .input('category_id', sql.Int, categoryId)
      .query(`
        SELECT COUNT(DISTINCT p.product_id) as total
        FROM Product p
        INNER JOIN Category_Product cp ON p.product_id = cp.product_id
        WHERE cp.category_id = @category_id
      `);

    const total = countResult.recordset[0].total;

    return {
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = CategoryModel;
