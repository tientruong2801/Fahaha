// import React from 'react';
// import { Link } from 'react-router-dom';

// const BookCard = ({ product }) => {
//   return (
//     <Link to={`/product/${product.id}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400/80 hover:shadow-md sm:p-4">
//       <div className="relative mb-3">
//         <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
//           {/* Nếu có ảnh thì hiển thị, không thì hiện placeholder */}
//           {product.image ? (
//             <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
//           ) : (
//             <span className="text-sm font-semibold text-slate-400 group-hover:text-blue-600">Bìa sách</span>
//           )}
//         </div>
//         {product.tag && (
//           <span className="absolute left-2 top-2 rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700">
//             {product.tag}
//           </span>
//         )}
//       </div>

//       <div className="flex flex-1 flex-col gap-1">
//         <h3 className="text-sm font-semibold tracking-tight text-slate-900 line-clamp-1">{product.name}</h3>
//         <p className="text-xs font-medium text-slate-500">{product.category}</p>
//         <div className="mt-1 flex items-center gap-1.5">
//           <span className="text-sm font-semibold text-blue-700">{product.price.toLocaleString()}đ</span>
//           {product.oldPrice && (
//             <span className="text-[0.65rem] font-medium text-slate-400 line-through">{product.oldPrice.toLocaleString()}đ</span>
//           )}
//         </div>
//         <button className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">
//           Thêm vào giỏ
//         </button>
//       </div>
//     </Link>
//   );
// };

// export default BookCard;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartApi from '../../api/cartApi';
import { useAuth } from '../../context/AuthContext';

const BookCard = ({ product }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation

    if (!isLoggedIn) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('/login');
      return;
    }

    // Check stock - use stock_quantity from backend or quantity as fallback
    const currentStock = product.stock_quantity !== undefined ? product.stock_quantity : (product.quantity !== undefined ? product.quantity : 10);

    if (currentStock <= 0) {
      toast.warning("Sản phẩm này tạm thời hết hàng!");
      return;
    }

    try {
      // Use product_id from backend (not id)
      const productId = product.product_id || product.id;

      await cartApi.addToCart({
        productId: productId,
        quantity: 1
      });

      toast.success(`Đã thêm 1 cuốn "${product.title || product.name}" vào giỏ!`);

      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  // Ngăn click lan ra ngoài thẻ Link
  const preventLink = (e) => e.preventDefault();

  return (
    <Link
      to={`/product/${product.product_id || product.id}`}
      className={`group flex flex-col rounded-2xl border bg-white p-3 shadow-sm transition sm:p-4 no-underline
        ${product.stock_quantity === 0 || product.quantity === 0 ? 'opacity-75 grayscale' : 'hover:-translate-y-0.5 hover:border-blue-400/80 hover:shadow-md border-slate-200'}
      `}
      style={{ textDecoration: 'none' }}
    >
      {/* ẢNH SẢN PHẨM */}
      <div className="relative mb-3">
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
          {product.image ? (
            <img src={product.image} alt={product.title || product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-slate-400">Bìa sách</span>
          )}
        </div>

        {/* Tag (Hot, New...) */}
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700">
            {product.tag}
          </span>
        )}

        {/* Nhãn HẾT HÀNG (Hiện ra nếu stock = 0) */}
        {(product.stock_quantity === 0 || product.quantity === 0) && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">Hết hàng</span>
          </div>
        )}
      </div>

      {/* THÔNG TIN */}
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 line-clamp-1">{product.title || product.name}</h3>
        <p className="text-xs font-medium text-slate-500">{product.categories || product.category || product.product_type || 'Khác'}</p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-blue-700">{product.price.toLocaleString()}đ</span>
            {product.oldPrice && (
              <span className="text-[0.65rem] font-medium text-slate-400 line-through">{product.oldPrice.toLocaleString()}đ</span>
            )}
          </div>

          {/* HIỂN THỊ TỒN KHO */}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${(product.stock_quantity || product.quantity || 0) > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {(product.stock_quantity || product.quantity || 0) > 0 ? `Còn: ${product.stock_quantity || product.quantity}` : 'Hết hàng'}
          </span>
        </div>

        {/* NÚT MUA HÀNG */}
        <div className="mt-auto pt-3" onClick={preventLink}>
          <button
            onClick={handleAddToCart}
            // Nếu hết hàng thì disable nút bấm và đổi màu xám
            disabled={(product.stock_quantity || product.quantity || 0) === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white transition-colors shadow-sm
                ${(product.stock_quantity || product.quantity || 0) === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}
              `}
          >
            <iconify-icon icon="lucide:shopping-cart" width="14"></iconify-icon>
            {(product.stock_quantity || product.quantity || 0) === 0 ? "Tạm hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;