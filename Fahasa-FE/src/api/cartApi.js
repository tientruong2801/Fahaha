import axiosClient from './axiosClient';

const cartApi = {
    // Lấy giỏ hàng
    getCart: () => axiosClient.get('/cart'),

    // Thêm sản phẩm vào giỏ
    addToCart: (data) => axiosClient.post('/cart/add', data),

    // Xóa sản phẩm khỏi giỏ
    removeFromCart: (productId) => axiosClient.delete(`/cart/${productId}`),

    // Cập nhật số lượng
    updateQuantity: (productId, quantity) => axiosClient.put(`/cart/${productId}`, { quantity }),
};

export default cartApi;
