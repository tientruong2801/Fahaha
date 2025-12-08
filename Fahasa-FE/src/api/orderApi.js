import axiosClient from './axiosClient';

const orderApi = {
    // Tạo đơn hàng từ giỏ hàng
    createOrder: (data) => axiosClient.post('/orders', data),

    // Lấy danh sách đơn hàng
    getOrders: () => axiosClient.get('/orders'),

    // Lấy chi tiết đơn hàng
    getOrderById: (orderId) => axiosClient.get(`/orders/${orderId}`),

    // Hủy đơn hàng
    cancelOrder: (orderId) => axiosClient.put(`/orders/${orderId}/cancel`),
};

export default orderApi;
