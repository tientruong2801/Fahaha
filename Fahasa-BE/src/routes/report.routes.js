const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Report routes - có thể thêm authenticateToken nếu cần bảo mật
router.get('/top-selling', reportController.getTopSellingProducts);
router.get('/monthly-revenue', reportController.getMonthlyRevenue);
router.get('/customer-spending', reportController.getCustomerTotalSpending);
router.get('/restock-cost', reportController.getRestockCost);

module.exports = router;
