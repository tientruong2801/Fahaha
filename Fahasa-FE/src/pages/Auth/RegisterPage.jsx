import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fname: '',
        lname: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fname: formData.fname,
                lname: formData.lname,
                phone: formData.phone
            });

            const data = response.data?.data || response.data;

            if (data && data.token && data.user) {
                // Lưu token vào localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Chuyển đến trang chủ
                navigate('/home');
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error('Register error:', err);

            const errorMessage = err.response?.data?.message
                || err.response?.data?.error
                || 'Đăng ký thất bại. Vui lòng thử lại!';

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
                        Tạo tài khoản mới và khám phá thế giới sách
                    </h2>
                    <p className="text-blue-100 text-lg">
                        Đăng ký ngay để trải nghiệm:
                    </p>
                    <ul className="mt-4 space-y-2 text-blue-100">
                        <li className="flex items-center gap-2">
                            <iconify-icon icon="lucide:check" width="20"></iconify-icon>
                            Mua sắm sách trực tuyến dễ dàng
                        </li>
                        <li className="flex items-center gap-2">
                            <iconify-icon icon="lucide:check" width="20"></iconify-icon>
                            Tích điểm thành viên
                        </li>
                        <li className="flex items-center gap-2">
                            <iconify-icon icon="lucide:check" width="20"></iconify-icon>
                            Theo dõi đơn hàng và lịch sử mua
                        </li>
                    </ul>
                </div>
                <div className="relative z-10 text-sm text-blue-200">© 2025 Fahaha Bookstore.</div>
            </div>

            {/* Cột phải (Form) */}
            <div className="flex w-full flex-col bg-white px-24 py-12 lg:w-1/2 lg:px-20 overflow-y-auto gap-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Đăng ký</h2>
                    <p className="text-sm text-slate-500">Tạo tài khoản mới để bắt đầu mua sắm.</p>
                </div>


                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        {/* Tên đăng nhập */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="nguyenvana"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="nguyenvana@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Họ và Tên */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Họ</label>
                                <input
                                    type="text"
                                    name="fname"
                                    required
                                    className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Nguyễn"
                                    value={formData.fname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tên</label>
                                <input
                                    type="text"
                                    name="lname"
                                    required
                                    className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Văn A"
                                    value={formData.lname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="0912345678"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                        {isLoading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                            Đăng nhập ngay
                        </Link>
                    </p>
                    <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
                        <iconify-icon icon="lucide:arrow-left" width="14"></iconify-icon>
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
