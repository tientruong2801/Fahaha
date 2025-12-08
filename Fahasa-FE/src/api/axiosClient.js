import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Port backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Tự động thêm token vào headers
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi 401 (unauthorized)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to home nếu cần
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;