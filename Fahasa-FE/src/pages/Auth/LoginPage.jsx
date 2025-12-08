import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Sử dụng login từ AuthContext

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi hàm login từ AuthContext (nó sẽ tự động cập nhật state)
      const user = await login(email, password);
      console.log('Logged in user:', user);

      // Chỉ navigate khi login thành công (user !== false và user !== null)
      if (user && typeof user === 'object') {
        // Điều hướng dựa theo role
        if (user.role === 'admin' || user.is_admin) {
          // Admin -> trang quản lý sản phẩm
          navigate('/admin/products');
        } else {
          // Customer -> trang chủ
          navigate('/home');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại!');
      }

    } catch (err) {
      console.error('Login error:', err);

      // Xử lý lỗi từ server
      const errorMessage = err.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại!';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Cột trái (Banner) */}
      <div className="hidden w-1/2 flex-col justify-between bg-blue-600 p-12 text-white lg:flex relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
            <span className="text-xl font-bold">F</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Fahaha</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Chào mừng gia nhập cộng đồng Fahaha. Cùng đọc sách và cười hahaha
          </h2>
          <p className="text-blue-100 text-lg">
            Sử dụng tài khoản có trong database để đăng nhập:<br />
            - <b>Admin:</b> do.f@fahasa.com / adminpass<br />
            - <b>Khách:</b> nguyen.a@example.com / pass123
          </p>
        </div>
        <div className="relative z-10 text-sm text-blue-200">© 2025 Fahaha Bookstore.</div>
      </div>

      {/* Cột phải (Form) */}
      <div className="flex w-full flex-col justify-center items-center bg-white px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-sm text-slate-500">Nhập email và mật khẩu để tiếp tục.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="do.f@fahasa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <iconify-icon icon="lucide:alert-circle"></iconify-icon>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? "Đang kiểm tra..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                Đăng ký ngay
              </Link>
            </p>
            <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
              <iconify-icon icon="lucide:arrow-left" width="14"></iconify-icon>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;