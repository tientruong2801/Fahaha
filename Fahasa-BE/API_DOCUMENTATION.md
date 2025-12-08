# API Documentation - Fahasa Backend

Base URL: `http://localhost:3000`

## 📋 Mục lục
1. [Authentication APIs](#authentication-apis)
2. [Product APIs](#product-apis)
3. [Category APIs](#category-apis)
4. [Cart APIs](#cart-apis)
5. [User APIs](#user-apis)
6. [Report APIs](#report-apis)

---

## 🔐 Authentication APIs

### 1. Đăng nhập
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "customer@gmail.com",
  "password": "customer"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 101,
    "username": "khachhang_A",
    "email": "customer@gmail.com",
    "fname": "Nguyễn Văn",
    "lname": "A",
    "role": "customer",
    "is_admin": 0
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email và mật khẩu không được để trống"
}
```

**Response Error (401/500):**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

**Cách sử dụng:**
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
// Lưu token vào localStorage
localStorage.setItem('token', data.token);
```

### 2. Xác thực token
**GET** `/api/auth/verify`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "user_id": 101,
    "email": "customer@gmail.com",
    "role": "customer"
  }
}
```

### 3. Lấy thông tin user hiện tại
**GET** `/api/auth/me`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 101,
    "username": "khachhang_A",
    "email": "customer@gmail.com",
    "fname": "Nguyễn Văn",
    "lname": "A",
    "created_date": "2023-01-15",
    "role": "customer",
    "member_type": "Gold",
    "total_fpoint": 1500
  }
}
```

---

## 📦 Product APIs

### 1. Lấy danh sách sản phẩm (có phân trang + tìm kiếm)
**GET** `/api/products?page=1&limit=10&search=nhà`

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số sản phẩm mỗi trang (default: 10)
- `search` (optional): Từ khóa tìm kiếm theo tên sản phẩm (tìm theo title, publisher, supplier)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "product_id": 1,
      "title": "Đắc Nhân Tâm",
      "publisher": "NXB Tổng Hợp TP.HCM",
      "supplier": "First News",
      "year": 2020,
      "product_type": "softcover",
      "stock_quantity": 150,
      "price": 100000.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

**Cách sử dụng:**
```javascript
const fetchProducts = async () => {
  const response = await fetch('http://localhost:3000/api/products?page=1&limit=10&search=nhà');
  const data = await response.json();
  setProducts(data.data);
  setPagination(data.pagination);
};
```

### 2. Lấy chi tiết sản phẩm theo ID
**GET** `/api/products/:id`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product_id": 1,
    "title": "Đắc Nhân Tâm",
    "publisher": "NXB Tổng Hợp TP.HCM",
    "supplier": "First News",
    "description": "Mô tả sách",
    "year": 2020,
    "language": "Tiếng Việt",
    "product_type": "softcover",
    "stock_quantity": 150,
    "price": 100000.00,
    "weight": 0.5,
    "size": "14x20cm",
    "authors": "Dale Carnegie",
    "images": [
      {
        "image_url": "image_url/product1/main1.jpg",
        "ordinal_number": 1
      }
    ],
    "categories": [
      {
        "category_id": 2,
        "category_name": "Văn Học"
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Cách sử dụng trong React:**
```javascript
useEffect(() => {
  const fetchProduct = async () => {
    const response = await fetch(`http://localhost:3000/api/products/${id}`);
    const result = await response.json();
    if (result.success) {
      setProduct(result.data);
    }
  };
  fetchProduct();
}, [id]);
```

### 3. Thêm sản phẩm (Admin)
**POST** `/api/products`

**Request Body:**
```json
{
  "title": "Sách mới",
  "publisher": "NXB ABC",
  "supplier": "Nhà cung cấp",
  "description": "Mô tả sách",
  "year": 2024,
  "language": "Tiếng Việt",
  "product_type": "softcover",
  "stock_quantity": 100,
  "price": 150000,
  "weight": 0.5,
  "size": "14x20cm",
  "authors": ["Tác giả 1", "Tác giả 2"],
  "images": ["url1.jpg", "url2.jpg"],
  "categories": [1, 2]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": 11,
    "title": "Sách mới",
    "publisher": "NXB ABC",
    "price": 150000
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

### 4. Cập nhật sản phẩm (Admin)
**PUT** `/api/products/:id`

**Request Body:** Các trường cần cập nhật (tương tự POST)
```json
{
  "title": "Tên sách cập nhật",
  "price": 180000,
  "stock_quantity": 200
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product_id": 1,
    "title": "Tên sách cập nhật",
    "price": 180000
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 5. Xóa sản phẩm (Admin)
**DELETE** `/api/products/:id`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "deleted": true
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 📂 Category APIs

### 1. Lấy tất cả danh mục
**GET** `/api/categories`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "category_id": 1,
      "category_name": "Sách Trong Nước",
      "description": null
    },
    {
      "category_id": 2,
      "category_name": "Văn Học",
      "description": null
    }
  ]
}
```

**Cách sử dụng:**
```javascript
useEffect(() => {
  const fetchCategories = async () => {
    const response = await fetch('http://localhost:3000/api/categories');
    const result = await response.json();
    if (result.success) {
      setCategories(result.data);
    }
  };
  fetchCategories();
}, []);
```

### 2. Lấy thông tin danh mục theo ID
**GET** `/api/categories/:id`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category_id": 1,
    "category_name": "Sách Trong Nước",
    "description": "Mô tả danh mục"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

### 3. Lấy sản phẩm theo danh mục
**GET** `/api/categories/:id/products?page=1&limit=20`

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số sản phẩm mỗi trang (default: 20)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category products retrieved successfully",
  "data": [
    {
      "product_id": 1,
      "title": "Đắc Nhân Tâm",
      "publisher": "NXB Tổng Hợp TP.HCM",
      "supplier": "First News",
      "year": 2020,
      "product_type": "softcover",
      "stock_quantity": 150,
      "price": 100000.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 🛒 Cart APIs

⚠️ **Lưu ý:** Hiện tại Cart APIs chưa tích hợp đầy đủ authentication. Tham số `userId` có thể được truyền qua query params hoặc request body. Trong production nên lấy từ token.

### 1. Lấy giỏ hàng
**GET** `/api/cart?userId=101`

**Query Parameters:**
- `userId` (optional): ID của user (mặc định: 1, trong production lấy từ token)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": [
    {
      "cart_id": "C-101",
      "product_id": 1,
      "quantity": 3,
      "title": "Đắc Nhân Tâm",
      "price": 100000.00,
      "stock_quantity": 150,
      "publisher": "NXB Tổng Hợp TP.HCM",
      "image_url": "image_url/product1/main1.jpg"
    }
  ]
}
```

**Cách sử dụng:**
```javascript
const fetchCart = async () => {
  const userId = 101; // Hoặc lấy từ context/token
  const response = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
  const result = await response.json();
  if (result.success) {
    setCartItems(result.data);
  }
};
```

### 2. Thêm sản phẩm vào giỏ
**POST** `/api/cart/add`

**Request Body:**
```json
{
  "userId": 101,
  "productId": 1,
  "quantity": 1
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã thêm vào giỏ hàng thành công",
  "data": {
    "cart_id": "C-101",
    "product_id": 1,
    "quantity": 2
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "userId and productId are required"
}
```

**Cách sử dụng trong BookCard:**
```javascript
const handleAddToCart = async (e) => {
  e.preventDefault();
  
  const userId = 101; // Lấy từ context/localStorage

  try {
    const response = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        productId: product.product_id,
        quantity: 1
      })
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra');
  }
};
```

### 3. Xóa sản phẩm khỏi giỏ
**DELETE** `/api/cart/:productId?userId=101`

**Query Parameters:**
- `userId` (optional): ID của user (mặc định: 1)

**URL Parameters:**
- `productId`: ID của sản phẩm cần xóa

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng",
  "data": null
}
```

**Cách sử dụng:**
```javascript
const handleRemove = async (productId) => {
  const userId = 101;
  const response = await fetch(
    `http://localhost:3000/api/cart/${productId}?userId=${userId}`,
    { method: 'DELETE' }
  );
  const result = await response.json();
  if (result.success) {
    alert(result.message);
    fetchCart(); // Refresh cart
  }
};
```

### 4. Cập nhật số lượng
**PUT** `/api/cart/:productId`

**URL Parameters:**
- `productId`: ID của sản phẩm cần cập nhật

**Request Body:**
```json
{
  "userId": 101,
  "quantity": 3
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật số lượng",
  "data": {
    "product_id": 1,
    "quantity": 3
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "productId and quantity are required"
}
```

### 5. Xóa toàn bộ giỏ hàng
**DELETE** `/api/cart?userId=101`

**Query Parameters:**
- `userId` (optional): ID của user (mặc định: 1)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa toàn bộ giỏ hàng",
  "data": null
}
```

---

## 👤 User APIs

⚠️ **Lưu ý:** Các APIs này hiện tại chỉ là placeholder và chưa có logic thực tế.

### 1. Lấy tất cả users
**GET** `/api/users`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get all users",
  "data": []
}
```

### 2. Lấy thông tin user theo ID
**GET** `/api/users/:id`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get user {id}",
  "data": {}
}
```

### 3. Tạo user mới
**POST** `/api/users`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fname": "Nguyễn",
  "lname": "Văn A"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "username": "newuser",
    "email": "user@example.com"
  }
}
```

### 4. Cập nhật user
**PUT** `/api/users/:id`

**Request Body:** Các trường cần cập nhật
```json
{
  "fname": "Nguyễn Văn",
  "lname": "B"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User {id} updated successfully",
  "data": {}
}
```

### 5. Xóa user
**DELETE** `/api/users/:id`

**Response Success (200):**
```json
{
  "success": true,
  "message": "User {id} deleted successfully"
}
```

---

## 📊 Report APIs

### 1. Báo cáo sản phẩm bán chạy nhất
**GET** `/api/reports/top-selling?topN=10&month=11&year=2024&minQuantity=5`

**Query Parameters (tất cả đều optional):**
- `topN`: Số lượng sản phẩm top (ví dụ: 10)
- `month`: Tháng cần lọc (1-12)
- `year`: Năm cần lọc (ví dụ: 2024)
- `minQuantity`: Số lượng bán tối thiểu

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "title": "Đắc Nhân Tâm",
      "total_quantity_sold": 150,
      "total_revenue": 15000000.00
    },
    {
      "product_id": 5,
      "title": "Nhà Giả Kim",
      "total_quantity_sold": 120,
      "total_revenue": 12000000.00
    }
  ]
}
```

**Cách sử dụng:**
```javascript
const fetchTopSelling = async () => {
  const params = new URLSearchParams({
    topN: 10,
    month: 11,
    year: 2024
  });
  
  const response = await fetch(`http://localhost:3000/api/reports/top-selling?${params}`);
  const result = await response.json();
  if (result.success) {
    setTopProducts(result.data);
  }
};
```

### 2. Báo cáo doanh thu theo tháng
**GET** `/api/reports/monthly-revenue?year=2024`

**Query Parameters:**
- `year` **(required)**: Năm cần lấy báo cáo (ví dụ: 2024)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": 1,
      "year": 2024,
      "total_revenue": 50000000.00,
      "total_orders": 150
    },
    {
      "month": 2,
      "year": 2024,
      "total_revenue": 45000000.00,
      "total_orders": 130
    }
  ]
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp năm"
}
```

**Cách sử dụng:**
```javascript
const fetchMonthlyRevenue = async () => {
  const response = await fetch('http://localhost:3000/api/reports/monthly-revenue?year=2024');
  const result = await response.json();
  if (result.success) {
    setRevenueData(result.data);
  }
};
```

### 3. Báo cáo tổng chi tiêu của khách hàng
**GET** `/api/reports/customer-spending?customerId=101`

**Query Parameters:**
- `customerId` **(required)**: ID của khách hàng

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "customer_id": 101,
    "customer_name": "Nguyễn Văn A",
    "total_spending": 5000000.00,
    "total_orders": 25,
    "member_type": "Gold",
    "total_fpoint": 5000
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp ID khách hàng"
}
```

### 4. Báo cáo chi phí nhập hàng bổ sung
**GET** `/api/reports/restock-cost?categoryId=1&minStockThreshold=50`

**Query Parameters:**
- `categoryId` **(required)**: ID của danh mục
- `minStockThreshold` **(required)**: Ngưỡng tồn kho tối thiểu

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "category_id": 1,
    "category_name": "Sách Trong Nước",
    "products_need_restock": 15,
    "estimated_restock_cost": 25000000.00,
    "products": [
      {
        "product_id": 3,
        "title": "Sản phẩm cần nhập",
        "current_stock": 30,
        "suggested_restock": 100,
        "estimated_cost": 5000000.00
      }
    ]
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp ID danh mục và ngưỡng tồn kho tối thiểu"
}
```

---

## 🔧 Hướng dẫn sử dụng chung

### 1. Response Format chuẩn:

**Success Response:**
```json
{
  "success": true,
  "message": "Mô tả thành công",
  "data": { /* dữ liệu trả về */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

### 2. Cách gọi API có authentication:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/auth/verify', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  // Xử lý thành công
} else {
  // Xử lý lỗi
}
```

### 3. Xử lý lỗi:
```javascript
try {
  const response = await fetch('http://localhost:3000/api/products');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  // Xử lý data thành công
  console.log(result.data);
} catch (error) {
  console.error('Lỗi:', error.message);
  alert(error.message);
}
```

### 4. Pagination (cho APIs có phân trang):
```javascript
const fetchProducts = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search
  });

  const response = await fetch(`http://localhost:3000/api/products?${params}`);
  const result = await response.json();
  
  if (result.success) {
    setProducts(result.data);
    setPagination(result.pagination);
    // pagination = { page, limit, total, totalPages }
  }
};
```

### 5. Tài khoản test:
- **Admin:** 
  - Email: `admin@gmail.com`
  - Password: `admin`
  
- **Customer:**
  - Email: `customer@gmail.com`
  - Password: `customer`

---

## ⚠️ Lưu ý quan trọng

1. **Response Format:** Tất cả APIs đều trả về format có `success`, `message`, và `data` (nếu có).

2. **Token expiration:** Token có thời hạn 24 giờ. Sau đó cần đăng nhập lại.

3. **CORS:** Backend đã enable CORS cho tất cả origins. Trong production nên giới hạn.

4. **Password:** Hiện tại password được lưu plain text. Trong production nên dùng bcrypt để hash.

5. **Environment variables:** JWT_SECRET nên được đặt trong file `.env`:
```env
JWT_SECRET=your-super-secret-key-here
PORT=3000
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your-password
DB_NAME=fahasa
```

6. **Database connection:** Đảm bảo SQL Server đang chạy và database `fahasa` đã được tạo.

7. **Cart APIs:** Hiện tại chưa tích hợp đầy đủ authentication. userId được truyền qua query params hoặc body. Cần refactor để lấy từ token trong production.

8. **User APIs:** Các endpoints ở `/api/users` hiện tại chỉ là placeholder và chưa có logic thực tế.

---

## 🚀 Khởi động server

```bash
cd Fahasa-BE
npm install
npm start
# hoặc
npm run dev  # (với nodemon)
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 📝 Changelog

### Version 1.0.0
- Hoàn thiện APIs cho Authentication, Product, Category, Cart, và Report
- Thêm response format chuẩn với `success`, `message`, `data`
- Tích hợp JWT authentication cho Auth APIs
- Hỗ trợ pagination và search cho Product APIs
- Thêm các stored procedures cho Report APIs
