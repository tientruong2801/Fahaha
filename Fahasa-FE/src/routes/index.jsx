// src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';

// Layouts
import MainLayout from '../components/Layout/MainLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import AuthLayout from '../components/Layout/AuthLayout';

// Pages
import HomePage from '../pages/Customer/HomePage';
import ProductDetail from '../pages/Customer/ProductDetail';
import CartPage from '../pages/Customer/CartPage';
import ProfilePage from '../pages/Customer/ProfilePage';
import ProductPage from '../pages/Admin/ProductPage';
import ReportPage from '../pages/Admin/ReportPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="customer">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes - Bảo vệ toàn bộ admin section */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="reports" element={<ReportPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;