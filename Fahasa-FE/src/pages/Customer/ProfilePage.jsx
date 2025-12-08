import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import orderApi from '../../api/orderApi';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'info'

    // Load user from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        }
    }, []);

    // Load orders
    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getOrders();
            const apiData = response.data || response;

            if (apiData.success && apiData.data) {
                setOrders(apiData.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // View order detail
    const viewOrderDetail = async (orderId) => {
        try {
            const response = await orderApi.getOrderById(orderId);
            const apiData = response.data || response;

            if (apiData.success && apiData.data) {
                setSelectedOrder(apiData.data);
            }
        } catch (error) {
            console.error('Error loading order detail:', error);
            toast.error('Không thể tải chi tiết đơn hàng');
        }
    };

    // Cancel order
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await orderApi.cancelOrder(orderId);
            const apiData = response.data || response;

            if (apiData.success) {
                toast.success('Hủy đơn hàng thành công');
                loadOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Không thể hủy đơn hàng');
        }
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'lucide:clock', label: 'Chờ xử lý' },
            'Processing': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'lucide:package', label: 'Đang xử lý' },
            'Shipped': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'lucide:truck', label: 'Đang giao' },
            'Delivered': { color: 'bg-green-100 text-green-700 border-green-200', icon: 'lucide:check-circle', label: 'Đã giao' },
            'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: 'lucide:x-circle', label: 'Đã hủy' },
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                <iconify-icon icon={config.icon} width="14"></iconify-icon>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <iconify-icon icon="lucide:loader-2" width="48" class="text-blue-600 animate-spin"></iconify-icon>
                    <p className="mt-4 text-slate-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 inline-flex flex-row items-center gap-3">
                    <iconify-icon icon="lucide:user-circle" width="36"></iconify-icon>
                    <span>Tài khoản của tôi</span>
                </h1>
                <p className="text-slate-500 mt-1">Quản lý thông tin và đơn hàng của bạn</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'orders'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <iconify-icon icon="lucide:shopping-bag" width="18" class="inline mr-2"></iconify-icon>
                    Đơn hàng của tôi
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'info'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <iconify-icon icon="lucide:user" width="18" class="inline mr-2"></iconify-icon>
                    Thông tin cá nhân
                </button>
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders List */}
                    <div className="lg:col-span-2 space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                <iconify-icon icon="lucide:package-x" width="64" class="text-slate-300 mx-auto"></iconify-icon>
                                <p className="text-slate-500 mt-4 text-lg">Bạn chưa có đơn hàng nào</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div
                                    key={order.order_id}
                                    className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOrder?.order_id === order.order_id
                                        ? 'border-blue-500 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                        }`}
                                    onClick={() => viewOrderDetail(order.order_id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <iconify-icon icon="lucide:receipt" width="18"></iconify-icon>
                                                Đơn hàng #{order.order_id}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <iconify-icon icon="lucide:calendar" width="14" class="inline mr-1"></iconify-icon>
                                                {new Date(order.created_date).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <iconify-icon icon="lucide:package" width="16"></iconify-icon>
                                            <span>{order.total_items} sản phẩm</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <iconify-icon icon="lucide:wallet" width="16"></iconify-icon>
                                            <span>{order.payment_method}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 mt-3 pt-3 flex items-center justify-between">
                                        <span className="text-slate-600 text-sm">Tổng tiền:</span>
                                        <span className="font-bold text-xl text-blue-600">{order.total.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Detail Panel */}
                    <div className="lg:col-span-1">
                        {selectedOrder ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-slate-900">Chi tiết đơn hàng</h3>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <iconify-icon icon="lucide:x" width="20"></iconify-icon>
                                    </button>
                                </div>

                                {/* Order Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Mã đơn:</span>
                                        <span className="font-semibold">#{selectedOrder.order_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Ngày đặt:</span>
                                        <span className="font-semibold">
                                            {new Date(selectedOrder.created_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Trạng thái:</span>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Thanh toán:</span>
                                        <span className="font-semibold">{selectedOrder.payment_method}</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <iconify-icon icon="lucide:package" width="16"></iconify-icon>
                                        Sản phẩm ({selectedOrder.products?.length || 0})
                                    </h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {selectedOrder.products?.map((product) => (
                                            <div key={product.product_id} className="flex gap-3 p-2 bg-slate-50 rounded-lg">
                                                <div className="h-14 w-11 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.product_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <iconify-icon icon="lucide:image" class="text-slate-300"></iconify-icon>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-xs text-slate-900 truncate">{product.product_name}</p>
                                                    <p className="text-xs text-slate-500">SL: {product.quantity}</p>
                                                    <p className="text-xs font-semibold text-blue-600">{product.subtotal.toLocaleString()}đ</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Phí vận chuyển:</span>
                                        <span>{selectedOrder.shipping_fee.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Điểm sử dụng:</span>
                                        <span>-{selectedOrder.point_used} điểm</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Điểm tích lũy:</span>
                                        <span className="text-green-600 font-semibold">+{selectedOrder.point_earned} điểm</span>
                                    </div>
                                    <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                                        <span className="font-bold text-slate-900">Tổng cộng:</span>
                                        <span className="font-bold text-xl text-blue-600">{selectedOrder.total.toLocaleString()}đ</span>
                                    </div>
                                </div>

                                {/* Note */}
                                {selectedOrder.note && (
                                    <div className="border-t border-slate-200 pt-4">
                                        <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                                            <iconify-icon icon="lucide:message-square" width="14"></iconify-icon>
                                            Ghi chú:
                                        </p>
                                        <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded">{selectedOrder.note}</p>
                                    </div>
                                )}

                                {/* Cancel Button */}
                                {selectedOrder.status === 'Pending' && (
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder.order_id)}
                                        className="w-full py-2.5 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:x-circle" width="18"></iconify-icon>
                                        Hủy đơn hàng
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
                                <iconify-icon icon="lucide:mouse-pointer-click" width="48" class="text-slate-300 mx-auto"></iconify-icon>
                                <p className="text-slate-500 mt-4">Chọn đơn hàng để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <iconify-icon icon="lucide:user-circle" width="24"></iconify-icon>
                            Thông tin cá nhân
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <iconify-icon icon="lucide:user" width="20" class="text-slate-600"></iconify-icon>
                                <div>
                                    <p className="text-xs text-slate-500">Họ tên</p>
                                    <p className="font-semibold text-slate-900">{user?.name || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <iconify-icon icon="lucide:mail" width="20" class="text-slate-600"></iconify-icon>
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="font-semibold text-slate-900">{user?.email || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <iconify-icon icon="lucide:shield" width="20" class="text-slate-600"></iconify-icon>
                                <div>
                                    <p className="text-xs text-slate-500">Vai trò</p>
                                    <p className="font-semibold text-slate-900 capitalize">{user?.role || 'customer'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
