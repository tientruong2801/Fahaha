import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartApi from '../../api/cartApi';
import orderApi from '../../api/orderApi';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderData, setOrderData] = useState({
    payment_method: 'COD',
    shipping_fee: 30000,
    note: '',
    point_used: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load cart data from API
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      console.log("Cart data from API:", response);

      // Handle response structure: response.data contains the actual API response
      const apiData = response.data || response;
      console.log("Processed API data:", apiData);

      if (apiData.success && apiData.data) {
        console.log("Setting cart items:", apiData.data);
        setCartItems(apiData.data);
      } else {
        console.log("No cart data found");
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      await cartApi.removeFromCart(productId);
      // Reload cart after removing
      await loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại!');
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(item => item.product_id === productId);
    if (item) {
      const maxStock = item.stock_quantity || 999;
      if (newQuantity > maxStock) {
        toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
        return;
      }
    }

    try {
      await cartApi.updateQuantity(productId, newQuantity);
      // Reload cart after updating
      await loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error('Không thể cập nhật số lượng. Vui lòng thử lại!');
    }
  };

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const finalTotal = totalAmount + orderData.shipping_fee;

  // Handle checkout
  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      const response = await orderApi.createOrder(orderData);

      if (response.data.success) {
        toast.success('Đặt hàng thành công! 🎉');
        setShowCheckoutModal(false);
        // Reload cart to clear it
        await loadCart();
        window.dispatchEvent(new Event('cartUpdated'));

        // Navigate to order detail or order list
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <iconify-icon icon="lucide:loader-2" width="48" class="text-blue-600 animate-spin"></iconify-icon>
          <p className="mt-4 text-slate-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Loading state - only show when no data yet
  if (loading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <iconify-icon icon="lucide:loader-2" width="48" class="text-blue-600 animate-spin"></iconify-icon>
        <p className="text-slate-500 text-lg font-medium">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  // Empty cart UI
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white rounded-xl shadow-sm border border-slate-200 mx-auto max-w-4xl mt-6 p-8">
        <iconify-icon icon="lucide:shopping-cart" width="64" class="text-slate-300"></iconify-icon>
        <p className="text-slate-500 text-lg font-medium">Giỏ hàng của bạn đang trống trơn.</p>
        <Link to="/home" className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-sm">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Cart items UI
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
        <iconify-icon icon="lucide:shopping-bag"></iconify-icon>
        Giỏ hàng của bạn
        <span className="text-base font-normal text-slate-500">({cartItems.length} sản phẩm)</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.product_id} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-white items-center shadow-sm">

              {/* Image */}
              <div className="h-24 w-20 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">No Img</span>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{item.product_name}</h3>
                <p className="text-sm text-slate-500 mb-2">{item.category_name}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 font-bold">{item.price.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Quantity controls & Delete */}
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Xóa sản phẩm"
                >
                  <iconify-icon icon="lucide:trash-2" width="18"></iconify-icon>
                </button>

                <div className="flex items-center border border-slate-200 rounded-lg h-8 bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-full flex items-center justify-center hover:bg-white rounded-l-lg transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-full flex items-center justify-center hover:bg-white rounded-r-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={async () => {
                if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
                  try {
                    // Remove all items one by one
                    for (const item of cartItems) {
                      await cartApi.removeFromCart(item.product_id);
                    }
                    await loadCart();
                    window.dispatchEvent(new Event('cartUpdated'));
                  } catch (error) {
                    console.error("Error clearing cart:", error);
                    toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại!');
                  }
                }
              }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <iconify-icon icon="lucide:trash"></iconify-icon> Xóa tất cả
            </button>
          </div>
        </div>

        {/* Payment summary */}
        <div className="h-fit p-6 border border-slate-200 rounded-xl bg-white shadow-sm sticky top-24">
          <h3 className="font-semibold text-slate-900 mb-4">Thông tin thanh toán</h3>

          <div className="flex justify-between mb-3 text-slate-600 text-sm">
            <span>Tạm tính:</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between mb-3 text-slate-600 text-sm">
            <span>Phí vận chuyển:</span>
            <span>{orderData.shipping_fee.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between mb-3 text-slate-600 text-sm">
            <span>Giảm giá:</span>
            <span>0đ</span>
          </div>

          <div className="border-t border-slate-200 my-4"></div>

          <div className="flex justify-between mb-6">
            <span className="font-bold text-slate-900">Tổng cộng:</span>
            <span className="font-bold text-xl text-blue-700">{finalTotal.toLocaleString()}đ</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            <iconify-icon icon="lucide:credit-card"></iconify-icon>
            Tiến hành đặt hàng
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <iconify-icon icon="lucide:shopping-cart"></iconify-icon>
                  Xác nhận đơn hàng
                </h3>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <iconify-icon icon="lucide:x" width="24"></iconify-icon>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <iconify-icon icon="lucide:package"></iconify-icon>
                  Sản phẩm ({cartItems.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-16 w-12 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <iconify-icon icon="lucide:image" class="text-slate-300"></iconify-icon>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{(item.price * item.quantity).toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <iconify-icon icon="lucide:wallet"></iconify-icon>
                  Phương thức thanh toán
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={orderData.payment_method === 'COD'}
                      onChange={(e) => setOrderData({ ...orderData, payment_method: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-slate-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                    <iconify-icon icon="lucide:banknote" width="24" class="text-blue-600"></iconify-icon>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="BANK"
                      disabled
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-slate-500">Chức năng đang phát triển</p>
                    </div>
                    <iconify-icon icon="lucide:building-2" width="24" class="text-slate-400"></iconify-icon>
                  </label>
                </div>
              </div>

              {/* Shipping Fee */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <iconify-icon icon="lucide:truck"></iconify-icon>
                  Phí vận chuyển
                </h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <iconify-icon icon="lucide:package" class="text-slate-600" width="20"></iconify-icon>
                  <span className="flex-1 text-slate-900">Phí vận chuyển tiêu chuẩn</span>
                  <span className="font-semibold text-blue-600">{orderData.shipping_fee.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Note */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <iconify-icon icon="lucide:message-square"></iconify-icon>
                  Ghi chú đơn hàng
                </h4>
                <textarea
                  value={orderData.note}
                  onChange={(e) => setOrderData({ ...orderData, note: e.target.value })}
                  placeholder="Ví dụ: Giao hàng vào buổi sáng..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Tạm tính:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{orderData.shipping_fee.toLocaleString()}đ</span>
                </div>
                <div className="border-t border-slate-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="font-bold text-2xl text-blue-600">{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <iconify-icon icon="lucide:loader-2" class="animate-spin"></iconify-icon>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <iconify-icon icon="lucide:check-circle"></iconify-icon>
                      Xác nhận đặt hàng
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;