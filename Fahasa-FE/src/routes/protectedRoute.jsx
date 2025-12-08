import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Đọc user từ localStorage
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = userStr ? JSON.parse(userStr) : null;

  // Nếu chưa đăng nhập, chuyển về trang chủ
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (requiredRole) {
    const userRole = user.role ? user.role.toLowerCase() : '';

    // Kiểm tra role không khớp
    if (userRole !== requiredRole.toLowerCase()) {
      // Nếu admin cố truy cập trang customer, chuyển về admin
      if (userRole === 'admin') {
        return <Navigate to="/admin/products" replace />;
      }
      // Nếu customer cố truy cập trang admin, chuyển về home
      if (userRole === 'customer') {
        return <Navigate to="/home" replace />;
      }
      // Các trường hợp khác chuyển về root
      return <Navigate to="/login" replace />;
    }
  }

  // Cho phép truy cập
  return children;
};

export default ProtectedRoute;