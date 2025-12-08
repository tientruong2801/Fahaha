import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 antialiased font-sans">
      {/* HEADER */}
      <Navbar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* ================= FOOTER (GIỮ NGUYÊN CỦA BẠN) ================= */}
      <footer className="mt-8 border-t border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">

            {/* Cột 1: Brand */}
            <div className="md:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="text-base font-semibold tracking-tight">F</span>
                </div>
                <span className="text-base font-semibold tracking-tight text-slate-900">Fahaha</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Nền tảng mua sách trực tuyến cho mọi lứa tuổi.</p>
            </div>

            {/* Cột 2: Tài khoản */}
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Tài khoản của tôi</h3>
              <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                <li><Link to="/" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Đăng nhập</Link></li>
                <li><Link to="/profile" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Chi tiết tài khoản</Link></li>
                <li><Link to="/cart" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Chi tiết giỏ hàng</Link></li>
              </ul>
            </div>

            {/* Cột 3: Liên kết */}
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Liên kết</h3>
              <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                <li><Link to="/home" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Trang chủ</Link></li>
                <li><Link to="/promo" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Khuyến mãi</Link></li>
                <li><Link to="/blog" className="hover:text-blue-700" style={{ textDecoration: 'none' }}>Góc đọc sách</Link></li>
              </ul>
            </div>

            {/* Cột 4: Công ty */}
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Công ty</h3>
              <ul className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                <li><a href="#" className="hover:text-blue-700">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-blue-700">Hệ thống cửa hàng</a></li>
                <li><a href="#" className="hover:text-blue-700">Tuyển dụng</a></li>
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

export default MainLayout;