import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../../components/Customer/BookCard';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        // Backend trả về { success, message, data: [...] }
        const categoriesData = response.data?.data || response.data || [];
        const categoryNames = ['Tất cả', ...categoriesData.map(cat => cat.category_name)];
        setCategories(categoryNames);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(['Tất cả']); // Fallback to default
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productApi.getAll({
          page: 1,
          limit: 100, // Lấy nhiều để filter ở client
          search: searchTerm
        });
        setAllProducts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    const matchCategory = selectedCategory === 'Tất cả' ||
      (product.categories && product.categories.includes(selectedCategory));
    const matchSearch = product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex flex-col sm:px-6 lg:px-8 max-w-6xl mx-auto p-4 gap-8">

      {/* Banner */}
      <section className="grid gap-6 md:grid-cols-[2fr_1.4fr] md:items-center py-6">
        <div className="space-y-4">
          <h1 className="sm:text-3xl lg:text-4xl text-xl font-semibold text-slate-900 tracking-tight">
            Khám phá thế giới sách <span className="text-blue-700">chính hãng</span>
          </h1>
          <p className="text-base font-medium text-slate-600">
            Hơn 10.000 đầu sách đang chờ bạn khám phá.
          </p>
        </div>
      </section>

      {/* Thanh danh mục */}
      <div className="sticky top-[73px] z-40 bg-white/95 py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-100 sm:border-none sm:static">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 items-center">
          <span className="whitespace-nowrap text-sm font-medium text-slate-500 mr-2 hidden sm:block">Danh mục:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200
                 ${selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }
               `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <section className="space-y-4 min-h-[400px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {searchTerm
              ? `Kết quả tìm kiếm: "${searchTerm}"`
              : (selectedCategory === "Tất cả" ? "Tất cả sách" : selectedCategory)
            }
          </h2>
          <span className="text-sm text-slate-500">{filteredProducts.length} sản phẩm</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-slate-500">Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <BookCard
                key={product.product_id}
                product={{
                  product_id: product.product_id,
                  id: product.product_id,
                  title: product.title,
                  name: product.title,
                  categories: product.categories,
                  category: product.categories,
                  product_type: product.product_type,
                  price: product.price,
                  stock_quantity: product.stock_quantity,
                  quantity: product.stock_quantity,
                  image: product.image_url
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p>Không tìm thấy sách nào phù hợp.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;