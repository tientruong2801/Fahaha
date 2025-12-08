// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import ProductCard from '../../components/Admin/ProductCard';
import ProductForm from '../../components/Admin/ProductForm';
import ConfirmDelete from '../../components/ConfirmDelete';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryApi.getAll();
                setCategories(response.data.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = async (page) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: 8,
                search: searchText
            };

            if (selectedCategory) {
                params.categoryId = selectedCategory;
            }

            const response = await productApi.getAll(params);

            setProducts(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
            setCurrentPage(response.data.pagination.page);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(currentPage); }, [currentPage, selectedCategory]);

    const handleSearch = () => { setCurrentPage(1); fetchProducts(1); };

    const handleAddNew = () => { setIsEdit(false); setEditingProduct(null); setShowForm(true); };

    const handleEditClick = (product) => { setIsEdit(true); setEditingProduct(product); setShowForm(true); };

    const handleSubmitForm = async (formData) => {
        try {
            if (isEdit) {
                // Sửa: Dùng product_id thay vì id
                await productApi.update(formData.product_id, formData);
                toast.success("Cập nhật thành công!");
            } else {
                await productApi.create(formData);
                toast.success("Thêm mới thành công!");
            }
            setShowForm(false);
            fetchProducts(currentPage);
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const openDeleteModal = (id) => { setDeleteId(id); setShowConfirm(true); };

    const handleConfirmDelete = async () => {
        try {
            await productApi.delete(deleteId);
            toast.success("Đã xóa sản phẩm!");
            setShowConfirm(false);
            fetchProducts(currentPage);
        } catch (error) {
            toast.error("Lỗi xóa: " + (error.response?.data?.message || error.message));
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top Navigation Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Title and Stats */}
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Quản Lý Sản Phẩm</h1>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Tổng: <span className="font-semibold text-blue-600">{products.length}</span> sản phẩm
                                </p>
                            </div>
                        </div>

                        {/* Right: Search and Actions */}
                        <div className="flex items-center gap-3">
                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>

                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-80 px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Tìm kiếm theo tên, tác giả, nhà xuất bản..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>

                            <button
                                onClick={handleAddNew}
                                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span>Thêm Sản Phẩm</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product List */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {searchText ? (
                                <>
                                    Kết quả tìm kiếm: <span className="text-blue-600">"{searchText}"</span>
                                </>
                            ) : selectedCategory ? (
                                <>
                                    Danh mục: <span className="text-blue-600">
                                        {categories.find(c => c.category_id == selectedCategory)?.category_name}
                                    </span>
                                </>
                            ) : (
                                'Danh sách sản phẩm'
                            )}
                        </h2>
                        <div className="flex items-center gap-3">
                            <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Sắp xếp: Mới nhất</option>
                                <option>Tên A-Z</option>
                                <option>Tên Z-A</option>
                                <option>Giá thấp đến cao</option>
                                <option>Giá cao đến thấp</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm">Đang tải...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.product_id}
                                    product={product}
                                    onEdit={handleEditClick}
                                    onDelete={() => openDeleteModal(product.product_id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                            <i className="fa-solid fa-box-open text-5xl mb-4 text-slate-300"></i>
                            <p className="text-sm">Không tìm thấy sản phẩm nào.</p>
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10 mb-6">
                        <nav className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </nav>
                    </div>
                )}

                <ProductForm
                    show={showForm}
                    handleClose={() => setShowForm(false)}
                    handleSubmit={handleSubmitForm}
                    initialData={editingProduct}
                    isEdit={isEdit}
                />
                <ConfirmDelete
                    show={showConfirm}
                    handleClose={() => setShowConfirm(false)}
                    handleConfirm={handleConfirmDelete}
                    message="Bạn có chắc chắn muốn xóa sản phẩm này?"
                />
            </div>
        </div>
    );
};
export default ProductPage;