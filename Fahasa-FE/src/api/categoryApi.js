import axiosClient from './axiosClient';

const categoryApi = {
    // Lấy tất cả danh mục
    getAll: () => axiosClient.get('/categories'),

    // Lấy sản phẩm theo danh mục
    getProducts: (categoryId, params) => axiosClient.get(`/categories/${categoryId}/products`, { params }),
};

export default categoryApi;
