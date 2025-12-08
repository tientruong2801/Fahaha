import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import cartApi from '../../api/cartApi';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch product detail from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await productApi.getAll({ page: 1, limit: 1000 });
        const foundProduct = response.data.data.find(p => p.product_id === parseInt(id));

        if (foundProduct) {
          setProduct({
            id: foundProduct.product_id,
            name: foundProduct.title,
            price: foundProduct.price,
            category: foundProduct.product_type || 'Sách',
            stock: foundProduct.stock_quantity,
            image: foundProduct.image_url,
            publisher: foundProduct.publisher,
            supplier: foundProduct.supplier,
            publishYear: foundProduct.year,
            type: 'Bìa mềm',
            description: foundProduct.description || 'Chưa có mô tả cho sản phẩm này.'
          });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('/login');
      return;
    }

    if (!product) return;

    if (quantity > product.stock_quantity) {
      toast.warning(`Xin lỗi, kho chỉ còn ${product.stock_quantity} sản phẩm!`);
      return;
    }

    try {
      await cartApi.addToCart({
        productId: product.product_id || product.id,
        quantity: quantity
      });

      toast.success(`Đã thêm ${quantity} cuốn "${product.title || product.name}" vào giỏ hàng!`);

      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  // --- GIAO DIỆN LOADING ---
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center space-x-2">
      <iconify-icon icon="lucide:loader-2" class="animate-spin text-blue-600 text-2xl"></iconify-icon>
      <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
    </div>
  );

  // --- GIAO DIỆN KHI KHÔNG TÌM THẤY SP ---
  if (!product) return (
    <div className="text-center p-10 flex flex-col items-center">
      <iconify-icon icon="lucide:file-question" width="48" class="text-slate-300 mb-4"></iconify-icon>
      <h2 className="text-xl font-semibold text-slate-700">Không tìm thấy sản phẩm này!</h2>
      <Link to="/home" className="mt-4 text-blue-600 hover:text-blue-800 font-medium">Quay về trang chủ</Link>
    </div>
  );

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb (Thanh điều hướng nhỏ) */}
      <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link to="/home" className="hover:text-blue-600 transition" style={{ textDecoration: 'none' }}>Trang chủ</Link>
        <iconify-icon icon="lucide:chevron-right" width="12"></iconify-icon>
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">

        {/* === CỘT TRÁI: HÌNH ẢNH === */}
        <div className="flex items-center justify-center bg-slate-50 rounded-xl p-6 border border-slate-100">
          {product.image ? (
            <img src={product.image} alt={product.name} className="max-h-[450px] w-auto shadow-lg rounded-lg object-contain transition-transform hover:scale-105 duration-300" />
          ) : (
            <div className="h-96 w-64 bg-slate-200 flex items-center justify-center text-slate-400 font-bold rounded-lg">
              Chưa có ảnh
            </div>
          )}
        </div>

        {/* === CỘT PHẢI: THÔNG TIN CHI TIẾT === */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase tracking-wide">
              {product.category}
            </span>
            <span className="text-slate-400 text-xs">|</span>
            <span className="text-slate-500 text-xs">Mã SP: {product.id}</span>
          </div>

          {/* Giá tiền */}
          <div className="flex items-end gap-3 pb-6 border-b border-slate-100 mb-6">
            <span className="text-3xl font-bold text-blue-700">{product.price.toLocaleString()}đ</span>
            {product.oldPrice && (
              <span className="text-lg text-slate-400 line-through mb-1">{product.oldPrice.toLocaleString()}đ</span>
            )}
          </div>

          {/* BẢNG THÔNG TIN (Layout Grid 2 cột) */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm text-slate-700 mb-8">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Nhà cung cấp</span>
              <span className="font-semibold">{product.supplier || "Đang cập nhật"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Nhà xuất bản</span>
              <span className="font-semibold">{product.publisher || "Đang cập nhật"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Năm xuất bản</span>
              <span className="font-semibold">{product.publishYear || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Hình thức</span>
              <span className="font-semibold">{product.type || "Tiêu chuẩn"}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tình trạng kho</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <iconify-icon icon="lucide:check-circle" width="14"></iconify-icon>
                  Còn hàng (Sẵn sàng giao {product.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <iconify-icon icon="lucide:x-circle" width="14"></iconify-icon>
                  Hết hàng tạm thời
                </span>
              )}
            </div>
          </div>

          {/* KHU VỰC MUA HÀNG */}
          <div className="mt-auto">
            <p className="mb-2 text-sm font-medium text-slate-900">Chọn số lượng:</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

              {/* Bộ chọn số lượng */}
              <div className="flex items-center border border-slate-300 rounded-lg h-11 w-32 bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full hover:bg-slate-50 rounded-l-lg text-lg text-slate-600 transition flex items-center justify-center"
                  disabled={product.stock === 0}
                >-</button>
                <input
                  type="number"
                  className="w-full h-full text-center border-none focus:ring-0 p-0 text-slate-900 font-bold bg-transparent"
                  value={quantity}
                  readOnly
                />
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-full hover:bg-slate-50 rounded-r-lg text-lg text-slate-600 transition flex items-center justify-center"
                  disabled={product.stock === 0}
                >+</button>
              </div>

              {/* Nút Thêm vào giỏ */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 h-11 px-6 rounded-lg font-bold text-white transition shadow-md flex items-center justify-center gap-2
                  ${product.stock === 0
                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
                  }
                `}
              >
                <iconify-icon icon="lucide:shopping-cart" width="18"></iconify-icon>
                {product.stock === 0 ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>

          {/* MÔ TẢ SẢN PHẨM */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-3">Mô tả sản phẩm</h3>
            <div className="text-slate-600 leading-7 text-sm text-justify bg-slate-50 p-4 rounded-xl border border-slate-100">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;