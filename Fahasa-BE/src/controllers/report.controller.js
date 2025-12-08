const reportService = require('../services/report.service');

const reportController = {
    // Lấy báo cáo sản phẩm bán chạy nhất
    getTopSellingProducts: async (req, res) => {
        try {
            const { topN, month, year, minQuantity } = req.query;

            const result = await reportService.getTopSellingProducts({
                topN: topN ? parseInt(topN) : null,
                month: month ? parseInt(month) : null,
                year: year ? parseInt(year) : null,
                minQuantity: minQuantity ? parseInt(minQuantity) : null
            });

            res.json({
                success: true,
                data: result
            });
        } catch (err) {
            console.error("Lỗi lấy báo cáo:", err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Lấy báo cáo doanh thu theo tháng
    getMonthlyRevenue: async (req, res) => {
        try {
            const { year } = req.query;

            if (!year) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp năm'
                });
            }

            const result = await reportService.getMonthlyRevenue({
                year: parseInt(year)
            });

            res.json({
                success: true,
                data: result
            });
        } catch (err) {
            console.error("Lỗi lấy báo cáo doanh thu:", err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Lấy tổng chi tiêu của khách hàng
    getCustomerTotalSpending: async (req, res) => {
        try {
            const { customerId } = req.query;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp ID khách hàng'
                });
            }

            const result = await reportService.getCustomerTotalSpending({
                customerId: parseInt(customerId)
            });

            res.json({
                success: true,
                data: result
            });
        } catch (err) {
            console.error("Lỗi lấy chi tiêu khách hàng:", err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Lấy chi phí nhập hàng bổ sung
    getRestockCost: async (req, res) => {
        try {
            const { categoryId, minStockThreshold } = req.query;

            if (!categoryId || !minStockThreshold) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp ID danh mục và ngưỡng tồn kho tối thiểu'
                });
            }

            const result = await reportService.getRestockCost({
                categoryId: parseInt(categoryId),
                minStockThreshold: parseInt(minStockThreshold)
            });

            res.json({
                success: true,
                data: result
            });
        } catch (err) {
            console.error("Lỗi tính chi phí nhập hàng:", err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

module.exports = reportController;
