import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import reportApi from '../../api/reportApi';
import categoryApi from '../../api/categoryApi';

const ReportPage = () => {
    const [activeTab, setActiveTab] = useState('top-selling');
    const [categories, setCategories] = useState([]);

    // State cho Top Selling Products
    const [topSellingFilters, setTopSellingFilters] = useState({
        month: 11,
        year: 2024,
        topN: 5,
        minQuantity: 1
    });
    const [topSellingData, setTopSellingData] = useState([]);
    const [topSellingLoading, setTopSellingLoading] = useState(false);

    // State cho Monthly Revenue
    const [revenueFilters, setRevenueFilters] = useState({
        year: 2024
    });
    const [revenueData, setRevenueData] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(false);

    // State cho Customer Spending
    const [customerFilters, setCustomerFilters] = useState({
        customerId: ''
    });
    const [customerData, setCustomerData] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(false);

    // State cho Restock Cost
    const [restockFilters, setRestockFilters] = useState({
        categoryId: '',
        minStockThreshold: 10
    });
    const [restockData, setRestockData] = useState(null);
    const [restockLoading, setRestockLoading] = useState(false);

    // Load categories khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll();
                console.log("Category API response:", res);
                // Backend trả về { success, message, data: [...] }
                const categoryData = res.data?.data || res.data || [];
                console.log("Parsed categories:", categoryData);
                setCategories(Array.isArray(categoryData) ? categoryData : []);
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
                setCategories([]); // Set empty array on error
            }
        };
        fetchCategories();
    }, []);

    // Hàm xử lý Top Selling Products
    const handleTopSellingSearch = async () => {
        setTopSellingLoading(true);
        try {
            const res = await reportApi.getTopSelling(topSellingFilters);
            const data = res.data?.data || res.data || [];
            setTopSellingData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching top selling:", error);
            toast.error("Lỗi tải báo cáo: " + (error.response?.data?.message || error.message));
            setTopSellingData([]);
        } finally {
            setTopSellingLoading(false);
        }
    };

    // Hàm xử lý Monthly Revenue
    const handleRevenueSearch = async () => {
        setRevenueLoading(true);
        try {
            const res = await reportApi.getMonthlyRevenue(revenueFilters);
            const data = res.data?.data || res.data || [];
            setRevenueData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching revenue:", error);
            toast.error("Lỗi tải báo cáo doanh thu: " + (error.response?.data?.message || error.message));
            setRevenueData([]);
        } finally {
            setRevenueLoading(false);
        }
    };

    // Hàm xử lý Customer Spending
    const handleCustomerSpendingSearch = async () => {
        if (!customerFilters.customerId) {
            toast.warning("Vui lòng nhập ID khách hàng");
            return;
        }
        setCustomerLoading(true);
        try {
            const res = await reportApi.getCustomerSpending(customerFilters);
            const data = res.data?.data || res.data;
            setCustomerData(data);
        } catch (error) {
            console.error("Error fetching customer spending:", error);
            toast.error("Lỗi tải chi tiêu khách hàng: " + (error.response?.data?.message || error.message));
            setCustomerData(null);
        } finally {
            setCustomerLoading(false);
        }
    };

    // Hàm xử lý Restock Cost
    const handleRestockCostSearch = async () => {
        if (!restockFilters.categoryId) {
            toast.warning("Vui lòng chọn danh mục");
            return;
        }
        setRestockLoading(true);
        try {
            const res = await reportApi.getRestockCost(restockFilters);
            const data = res.data?.data || res.data;
            setRestockData(data);
        } catch (error) {
            console.error("Error fetching restock cost:", error);
            toast.error("Lỗi tính chi phí nhập hàng: " + (error.response?.data?.message || error.message));
            setRestockData(null);
        } finally {
            setRestockLoading(false);
        }
    };

    const handleExportTopSelling = () => {
        if (topSellingData.length === 0) return;

        // Chuẩn bị dữ liệu cho Excel
        const worksheetData = [
            ['ID', 'Tên Sản Phẩm', 'Số Lượng Bán', 'Doanh Thu'], // Header
            ...topSellingData.map(item => [
                item.product_id,
                item.title,
                item.TotalSold,
                item.RevenueGenerated
            ])
        ];

        // Tạo worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Đặt độ rộng cột
        worksheet['!cols'] = [
            { wch: 10 }, // ID
            { wch: 40 }, // Tên Sản Phẩm
            { wch: 15 }, // Số Lượng Bán
            { wch: 15 }  // Doanh Thu
        ];

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản Phẩm Bán Chạy');

        // Xuất file Excel
        XLSX.writeFile(workbook, 'bao_cao_ban_chay.xlsx');
    };

    const handleExportRevenue = () => {
        if (revenueData.length === 0) return;

        // Chuẩn bị dữ liệu cho Excel
        const worksheetData = [
            ['Tháng', 'Tổng Đơn Hàng', 'Doanh Thu'], // Header
            ...revenueData.map(item => [
                `Tháng ${item.Month}`,
                item.TotalOrders,
                item.TotalRevenue
            ]),
            // Thêm dòng tổng
            [
                'TỔNG',
                revenueData.reduce((sum, item) => sum + item.TotalOrders, 0),
                revenueData.reduce((sum, item) => sum + parseFloat(item.TotalRevenue), 0)
            ]
        ];

        // Tạo worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Đặt độ rộng cột
        worksheet['!cols'] = [
            { wch: 15 }, // Tháng
            { wch: 15 }, // Tổng Đơn Hàng
            { wch: 20 }  // Doanh Thu
        ];

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Doanh Thu Theo Tháng');

        // Xuất file Excel
        XLSX.writeFile(workbook, `bao_cao_doanh_thu_${revenueFilters.year}.xlsx`);
    };

    const tabs = [
        { id: 'top-selling', label: 'Sản Phẩm Bán Chạy', icon: 'fa-fire' },
        { id: 'monthly-revenue', label: 'Doanh Thu Tháng', icon: 'fa-chart-line' },
        { id: 'customer-spending', label: 'Chi Tiêu KH', icon: 'fa-user-circle' },
        { id: 'restock-cost', label: 'Chi Phí Nhập Hàng', icon: 'fa-boxes' }
    ];

    return (
        <div className="flex flex-col sm:px-6 lg:px-8 max-w-7xl mx-auto p-4 gap-6">
            {/* Header */}
            <section className="py-4">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <i className="fa-solid fa-chart-pie text-blue-600"></i>
                    Báo Cáo & Thống Kê
                </h1>
                <p className="text-sm text-slate-600 mt-1">Hệ thống báo cáo sử dụng Functions & Procedures từ Database</p>
            </section>

            {/* Tabs */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-fit px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 bg-blue-50'
                                : 'border-transparent text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon} mr-2`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Tab Content - Top Selling Products */}
            {activeTab === 'top-selling' && (
                <>
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            <i className="fa-solid fa-filter text-blue-600 mr-2"></i>
                            Bộ Lọc - Sản Phẩm Bán Chạy
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tháng</label>
                                <select
                                    value={topSellingFilters.month}
                                    onChange={e => setTopSellingFilters({ ...topSellingFilters, month: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Năm</label>
                                <input
                                    type="number"
                                    value={topSellingFilters.year}
                                    onChange={e => setTopSellingFilters({ ...topSellingFilters, year: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">SL Tối Thiểu</label>
                                <input
                                    type="number"
                                    value={topSellingFilters.minQuantity}
                                    onChange={e => setTopSellingFilters({ ...topSellingFilters, minQuantity: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleTopSellingSearch}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-search mr-2"></i> Tìm Kiếm
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Kết quả ({topSellingData.length} sản phẩm)
                            </h2>
                            <button
                                onClick={handleExportTopSelling}
                                disabled={topSellingData.length === 0}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-file-excel mr-2"></i> Xuất Excel
                            </button>
                        </div>

                        {topSellingLoading ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : topSellingData.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-blue-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">ID SP</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tên Sản Phẩm</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Số Lượng Bán</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Doanh Thu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {topSellingData.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                                                        #{item.product_id}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                        {item.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                                            {item.TotalSold}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.RevenueGenerated)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i className="fa-solid fa-chart-simple text-4xl mb-3 text-slate-300"></i>
                                <p>Không có dữ liệu thỏa điều kiện</p>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Tab Content - Monthly Revenue */}
            {activeTab === 'monthly-revenue' && (
                <>
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            <i className="fa-solid fa-filter text-blue-600 mr-2"></i>
                            Bộ Lọc - Doanh Thu Theo Tháng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Năm</label>
                                <input
                                    type="number"
                                    value={revenueFilters.year}
                                    onChange={e => setRevenueFilters({ ...revenueFilters, year: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleRevenueSearch}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-search mr-2"></i> Xem Báo Cáo
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        {revenueLoading ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : revenueData.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Kết quả báo cáo năm {revenueFilters.year}
                                    </h2>
                                    <button
                                        onClick={handleExportRevenue}
                                        disabled={revenueData.length === 0}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fa-solid fa-file-excel mr-2"></i> Xuất Excel
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-green-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tháng</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Tổng Đơn Hàng</th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Doanh Thu</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {revenueData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                                            Tháng {item.Month}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                                                {item.TotalOrders} đơn
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.TotalRevenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">TỔNG</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-200 text-blue-900">
                                                            {revenueData.reduce((sum, item) => sum + item.TotalOrders, 0)} đơn
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-bold text-green-700">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                            revenueData.reduce((sum, item) => sum + parseFloat(item.TotalRevenue), 0)
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i className="fa-solid fa-chart-line text-4xl mb-3 text-slate-300"></i>
                                <p>Chưa có dữ liệu. Vui lòng chọn năm và tìm kiếm.</p>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Tab Content - Customer Spending */}
            {activeTab === 'customer-spending' && (
                <>
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            <i className="fa-solid fa-filter text-blue-600 mr-2"></i>
                            Tra Cứu - Tổng Chi Tiêu Khách Hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ID Khách Hàng</label>
                                <input
                                    type="number"
                                    value={customerFilters.customerId}
                                    onChange={e => setCustomerFilters({ ...customerFilters, customerId: e.target.value })}
                                    placeholder="Nhập ID khách hàng..."
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCustomerSpendingSearch}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-search mr-2"></i> Tra Cứu
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        {customerLoading ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : customerData ? (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg p-8">
                                <div className="text-center">
                                    <i className="fa-solid fa-wallet text-5xl text-blue-600 mb-4"></i>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Tổng Chi Tiêu</h3>
                                    <p className="text-sm text-slate-600 mb-4">Khách hàng ID: {customerFilters.customerId}</p>
                                    <div className="text-4xl font-bold text-blue-700">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customerData.TotalSpending)}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">Tính từ các đơn hàng đã hoàn thành</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i className="fa-solid fa-user-circle text-4xl mb-3 text-slate-300"></i>
                                <p>Nhập ID khách hàng để tra cứu chi tiêu</p>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Tab Content - Restock Cost */}
            {activeTab === 'restock-cost' && (
                <>
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            <i className="fa-solid fa-filter text-blue-600 mr-2"></i>
                            Tính Toán - Chi Phí Nhập Hàng Bổ Sung
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Danh Mục
                                    <span className="text-xs text-slate-500 ml-2">({categories.length} danh mục)</span>
                                </label>
                                <select
                                    value={restockFilters.categoryId}
                                    onChange={e => setRestockFilters({ ...restockFilters, categoryId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat.category_id} value={cat.category_id}>
                                                {cat.category_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Đang tải danh mục...</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngưỡng Tồn Kho</label>
                                <input
                                    type="number"
                                    value={restockFilters.minStockThreshold}
                                    onChange={e => setRestockFilters({ ...restockFilters, minStockThreshold: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleRestockCostSearch}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-calculator mr-2"></i> Tính Toán
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        {restockLoading ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p>Đang tính toán...</p>
                            </div>
                        ) : restockData ? (
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 shadow-lg p-8">
                                <div className="text-center">
                                    <i className="fa-solid fa-boxes text-5xl text-orange-600 mb-4"></i>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chi Phí Nhập Hàng Bổ Sung</h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Danh mục: {Array.isArray(categories) && categories.find(c => c.category_id == restockFilters.categoryId)?.category_name || 'N/A'}
                                    </p>
                                    <div className="text-4xl font-bold text-orange-700">
                                        {restockData.RestockCost === -1
                                            ? 'Danh mục không tồn tại'
                                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(restockData.RestockCost)
                                        }
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">Ngưỡng tồn kho: {restockFilters.minStockThreshold} sản phẩm</p>
                                    <p className="text-xs text-slate-400 mt-1">Giá nhập = 70% giá bán • Mục tiêu: 50 sản phẩm/mã</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i className="fa-solid fa-boxes text-4xl mb-3 text-slate-300"></i>
                                <p>Chọn danh mục và ngưỡng tồn kho để tính chi phí nhập hàng</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default ReportPage;