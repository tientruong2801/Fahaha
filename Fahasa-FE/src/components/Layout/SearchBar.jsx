// src/components/Layout/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const SearchBar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    // State nội bộ lưu chữ đang gõ
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

    // Cập nhật lại ô input nếu URL thay đổi (ví dụ bấm nút Back trình duyệt)
    useEffect(() => {
        setInputValue(searchParams.get('q') || '');
    }, [searchParams]);

    // DEBOUNCE: Tự động tìm sau khi ngừng gõ 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            // Lấy từ khóa hiện tại trên URL để so sánh
            const currentQuery = searchParams.get('q') || '';

            // Chỉ xử lý khi nội dung gõ KHÁC với nội dung trên URL
            if (inputValue !== currentQuery) {
                if (inputValue.trim()) {
                    // Nếu có chữ -> Đẩy lên URL
                    if (location.pathname !== '/home') {
                        navigate(`/home?q=${inputValue}`);
                    } else {
                        setSearchParams({ q: inputValue });
                    }
                } else {
                    // Nếu xóa hết chữ -> Xóa param q trên URL (nếu đang ở Home)
                    if (location.pathname === '/home') {
                        setSearchParams({});
                    }
                }
            }
        }, 500); // Chờ 0.5 giây sau khi gõ xong mới chạy lệnh tìm kiếm

        return () => clearTimeout(timer);
    }, [inputValue, navigate, location.pathname, setSearchParams, searchParams]);

    // Hàm cập nhật giao diện ô input ngay lập tức
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="w-full border border-slate-200 rounded-full px-4 py-2 shadow-sm flex items-center bg-slate-50/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <i className="fa-solid fa-magnifying-glass text-slate-400 mr-2"></i>
                <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    className="border-none bg-transparent w-full text-sm outline-none focus:ring-0 placeholder-slate-400 text-slate-700"
                    value={inputValue}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default SearchBar;
