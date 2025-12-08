const { getConnection, sql } = require('../config/database');

const reportService = {
    // Lấy báo cáo sản phẩm bán chạy nhất
    getTopSellingProducts: async (params) => {
        try {
            const { topN, month, year, minQuantity } = params;

            const pool = await getConnection();
            const request = pool.request();

            // Truyền tham số người dùng nhập vào stored procedure
            if (topN) request.input('TopN', sql.Int, topN);
            if (month) request.input('Month', sql.Int, month);
            if (year) request.input('Year', sql.Int, year);
            if (minQuantity) request.input('MinQuantity', sql.Int, minQuantity);

            const result = await request.execute('sp_GetTopSellingProducts');

            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Lấy báo cáo doanh thu theo tháng
    getMonthlyRevenue: async (params) => {
        try {
            const { year } = params;

            const pool = await getConnection();
            const request = pool.request();

            request.input('Year', sql.Int, year);

            const result = await request.execute('sp_GetMonthlyRevenue');

            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Tính tổng chi tiêu của khách hàng
    getCustomerTotalSpending: async (params) => {
        try {
            const { customerId } = params;

            const pool = await getConnection();
            const result = await pool.request()
                .input('CustomerID', sql.Int, customerId)
                .query('SELECT dbo.fn_CalcTotalSpending(@CustomerID) as TotalSpending');

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Tính chi phí nhập hàng bổ sung cho danh mục
    getRestockCost: async (params) => {
        try {
            const { categoryId, minStockThreshold } = params;

            const pool = await getConnection();
            const result = await pool.request()
                .input('CategoryID', sql.Int, categoryId)
                .input('MinStockThreshold', sql.Int, minStockThreshold)
                .query('SELECT dbo.fn_CalcRestockCost(@CategoryID, @MinStockThreshold) as RestockCost');

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }
};

module.exports = reportService;
