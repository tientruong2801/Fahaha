import axiosClient from './axiosClient';

const reportApi = {
    // Gọi API báo cáo sản phẩm bán chạy
    getTopSelling: (params) => {
        return axiosClient.get('/reports/top-selling', { params });
    },

    // Gọi API báo cáo doanh thu theo tháng
    getMonthlyRevenue: (params) => {
        return axiosClient.get('/reports/monthly-revenue', { params });
    },

    // Gọi API tính tổng chi tiêu của khách hàng
    getCustomerSpending: (params) => {
        return axiosClient.get('/reports/customer-spending', { params });
    },

    // Gọi API tính chi phí nhập hàng bổ sung
    getRestockCost: (params) => {
        return axiosClient.get('/reports/restock-cost', { params });
    }
};
export default reportApi;