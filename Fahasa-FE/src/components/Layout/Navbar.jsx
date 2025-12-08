// src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import cartApi from '../../api/cartApi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const { logout } = useAuth();

  // Kiểm tra xem đang ở trang nào để highlight menu
  const isActive = (path) => location.pathname.startsWith(path);

  // Đọc user từ localStorage
  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Load cart count from API
  const loadCartCount = async () => {
    try {
      const response = await cartApi.getCart();
      const apiData = response.data || response;

      if (apiData.success && apiData.data) {
        // Calculate total quantity from cart items
        const total = apiData.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout(); // Cập nhật state ở AuthContext nếu cần
    navigate('/login');
  };

  // Load user và cart khi component mount
  useEffect(() => {
    loadUser();
    loadCartCount();

    // Handler for cart updates - always reload from API
    const handleCartUpdate = () => {
      console.log('Cart updated - reloading from API');
      loadCartCount();
    };

    // Handler for user changes
    const handleUserChange = () => {
      loadUser();
      loadCartCount(); // Reload cart when user changes
    };

    // Listen to custom events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex gap-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pr-4 pb-4 pl-4 items-center justify-between">
        {/* Logo */}
        <Link to={user?.role === 'admin' ? '/admin/products' : '/home'} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <span className="text-xl font-semibold tracking-tight">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-slate-900">Fahaha</span>
            <span className="text-xs font-medium text-slate-500">
              {user?.role === 'admin' ? 'Quản trị viên' : 'Hiệu sách trực tuyến'}
            </span>
          </div>
        </Link>

        {/* Navigation Links - Chỉ hiển với Admin */}
        {user?.role === 'admin' && (
          <nav className="hidden md:flex gap-2">
            <Link
              to="/admin/products"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive('/admin/products')
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
              style={{ textDecoration: 'none' }}
            >
              <i className="fa-solid fa-box mr-2"></i>
              Quản Lý Sản Phẩm
            </Link>
            <Link
              to="/admin/reports"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive('/admin/reports')
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
              style={{ textDecoration: 'none' }}
            >
              <i className="fa-solid fa-chart-pie mr-2"></i>
              Báo Cáo
            </Link>
          </nav>
        )}

        {/* Search Bar - Chỉ hiển cho Customer */}
        {<SearchBar />}

        {/* Right Actions */}
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <>
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-user text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-700">{user.name || user.email}</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-shopping-cart"></i>
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[0.65rem] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white">
                  <i className="fa-solid fa-user text-slate-600"></i>
                  <span className="text-sm font-medium text-slate-700">{user.name || user.email}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;