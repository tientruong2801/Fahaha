import axiosClient from './axiosClient';

const authApi = {
    // Đăng nhập
    login: (credentials) => {
        return axiosClient.post('/auth/login', credentials);
    },

    // Đăng ký
    register: (userData) => {
        return axiosClient.post('/auth/register', userData);
    },

    // Xác thực token
    verifyToken: () => {
        return axiosClient.get('/auth/verify');
    },

    // Lấy thông tin user
    getUserInfo: (userId) => {
        return axiosClient.get(`/auth/user/${userId}`);
    }
};

export default authApi;
