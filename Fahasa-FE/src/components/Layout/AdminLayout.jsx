// src/components/Layout/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900 antialiased font-sans">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="flex gap-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pr-4 pb-4 pl-4 items-center">
                    {/* Logo & Brand */}
                    <Link to="/admin/products" className="flex items-center gap-2 sm:gap-3" style={{ textDecoration: 'none' }}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <span className="text-lg font-semibold tracking-tight">F</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold tracking-tight text-slate-900">Fahaha Admin</span>
                            <span className="text-xs font-medium text-slate-500">Quản lý hệ thống</span>
                        </div>
                    </Link>

                    {/* Navigation Links - Center */}
                    <div className="flex flex-1 justify-center">
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/admin/products"
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${location.pathname === '/admin/products'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700'
                                    }`}
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fa-solid fa-box"></i>
                                <span>Quản lý Sản phẩm</span>
                            </Link>
                            <Link
                                to="/admin/reports"
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${location.pathname === '/admin/reports'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700'
                                    }`}
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Báo cáo & Thống kê</span>
                            </Link>
                        </div>
                    </div>

                    {/* Actions: User & Logout */}
                    <div className="flex gap-3 items-center justify-end">
                        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white">
                            <i className="fa-solid fa-user-shield text-blue-600"></i>
                            <span className="text-sm font-medium text-slate-700">Administrator</span>
                        </div>

                        <Link
                            to="/login"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                logout();
                            }}
                            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                            style={{ textDecoration: 'none' }}
                        >
                            Đăng xuất
                        </Link>
                    </div>
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 bg-white">
                <Outlet />
            </main>

            {/* ================= FOOTER ================= */}
            <footer className="mt-8 border-t border-slate-200 bg-slate-50/80">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-4">

                        {/* Cột 1: Brand */}
                        <div className="md:col-span-1">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <span className="text-base font-semibold tracking-tight">F</span>
                                </div>
                                <span className="text-base font-semibold tracking-tight text-slate-900">Fahasa Admin</span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">Hệ thống quản lý hiệu sách trực tuyến.</p>
                        </div>

                        {/* Cột 2: Quản lý */}
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Quản lý</h3>
                            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                                <li><Link to="/admin/products" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Sản phẩm</Link></li>
                                <li><Link to="/admin/reports" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Báo cáo</Link></li>
                                <li><Link to="/admin/orders" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Đơn hàng</Link></li>
                            </ul>
                        </div>

                        {/* Cột 3: Hệ thống */}
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Hệ thống</h3>
                            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                                <li><Link to="/admin/settings" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Cài đặt</Link></li>
                                <li><Link to="/admin/users" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Người dùng</Link></li>
                                <li><Link to="/admin/logs" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Nhật ký</Link></li>
                            </ul>
                        </div>

                        {/* Cột 4: Hỗ trợ */}
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Hỗ trợ</h3>
                            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                                <li><a href="#" className="hover:text-blue-700">Tài liệu</a></li>
                                <li><a href="#" className="hover:text-blue-700">Liên hệ IT</a></li>
                                <li><a href="#" className="hover:text-blue-700">Báo lỗi</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Dòng bản quyền */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:text-sm text-xs font-medium text-slate-400 border-slate-200 border-t mt-8 pt-4 items-center justify-between">
                        <span>© 2025 Fahaha. Đã đăng ký bản quyền.</span>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-blue-700">Điều khoản sử dụng</a>
                            <a href="#" className="hover:text-blue-700">Chính sách bảo mật</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;
