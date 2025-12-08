// src/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';

const ProductForm = ({ show, handleClose, handleSubmit, initialData, isEdit }) => {
    const [formData, setFormData] = useState({
        product_id: '',
        title: '',
        publisher: 'NXB Trẻ',
        supplier: 'Nhà cung cấp mặc định',
        description: '',
        year: new Date().getFullYear(),
        language: 'Tiếng Việt',
        product_type: 'Sách',
        price: '',
        stock_quantity: '',
        weight: 0,
        size: 'M'
    });

    useEffect(() => {
        if (show && initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                product_id: '',
                title: '',
                publisher: 'NXB Trẻ',
                supplier: 'Nhà cung cấp mặc định',
                description: '',
                year: new Date().getFullYear(),
                language: 'Tiếng Việt',
                product_type: 'Sách',
                price: '',
                stock_quantity: '',
                weight: 0,
                size: 'M'
            });
        }
    }, [show, initialData]);

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(formData);
    };

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900">
                            {isEdit ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="space-y-4">
                            {/* Tên sản phẩm */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>

                            {/* Nhà xuất bản & Nhà cung cấp */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Nhà xuất bản
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.publisher}
                                        onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Nhà cung cấp
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Giá & Tồn kho */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Giá tiền <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">đ</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Tồn kho <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock_quantity}
                                        onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Mô tả
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                    placeholder="Nhập mô tả sản phẩm..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {isEdit ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
export default ProductForm;