import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Port backend của bạn
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
            // Chỉ xử lý auto-logout nếu KHÔNG phải đang ở trang login/register
            const isAuthPage = window.location.pathname === '/login' ||
                window.location.pathname === '/register' ||
                window.location.pathname === '/';

            if (!isAuthPage) {
                // Token hết hạn hoặc không hợp lệ - chỉ logout khi đang authenticated
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login
                window.location.href = '/login';
            }
            // Nếu đang ở trang login, để error được throw và xử lý ở component
        }
        return Promise.reject(error);
    }
);

export default axiosClient;