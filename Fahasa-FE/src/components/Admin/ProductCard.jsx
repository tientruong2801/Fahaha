// src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

    return (
        <div className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            {/* Product Image */}
            <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <i className="fa-solid fa-book text-4xl text-slate-300 mb-2"></i>
                            <p className="text-xs text-slate-400 font-medium">Bìa sách</p>
                        </div>
                    </div>
                )}

                {/* Admin Action Buttons - Overlay */}
                <div className="absolute top-2 right-2 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(product)}
                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-md"
                            title="Sửa"
                        >
                            <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button
                            onClick={() => onDelete(product.product_id)}
                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-md"
                            title="Xóa"
                        >
                            <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug min-h-[40px]" title={product.title}>
                    {product.title}
                </h3>

                <div className="mt-auto">
                    <p className="text-xs text-slate-500 mb-1">
                        {product.publisher}
                    </p>
                    {product.authors && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                            {product.authors}
                        </p>
                    )}
                </div>
                <p className="text-sm font-semibold text-blue-600">
                    {formattedPrice}
                </p>

                {/* Tồn */}
                <p className={`text-xs font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Tồn: {product.stock_quantity}
                </p>
            </div>
        </div>
    );
};
export default ProductCard;