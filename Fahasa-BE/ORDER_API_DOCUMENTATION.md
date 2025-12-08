# Order API Documentation

## Endpoints

### 1. Create Order
**POST** `/api/orders`

Tạo đơn hàng mới từ giỏ hàng hiện tại (bỏ qua bước thanh toán thực tế).

**Request Body:**
```json
{
  "payment_method": "COD",  // Optional, default: "COD"
  "shipping_fee": 30000,    // Optional, default: 30000
  "note": "Giao hàng vào buổi sáng",  // Optional
  "point_used": 0          // Optional, default: 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 1,
    "payment_id": 1,
    "total": 150000,
    "point_earned": 15,
    "status": "Pending"
  }
}
```

**Business Logic:**
- Kiểm tra giỏ hàng không rỗng
- Kiểm tra số lượng tồn kho
- Tính toán tổng tiền và điểm tích lũy (1 điểm/10,000 VND)
- Tạo bản ghi Payment và Orders
- Chuyển sản phẩm từ giỏ hàng sang Order_Product
- Cập nhật tồn kho sản phẩm
- Cập nhật điểm tích lũy khách hàng
- Xóa giỏ hàng sau khi đặt hàng thành công

---

### 2. Get All Orders
**GET** `/api/orders`

Lấy danh sách tất cả đơn hàng của khách hàng.

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "order_id": 1,
      "created_date": "2025-12-08",
      "status": "Pending",
      "total": 150000,
      "shipping_fee": 30000,
      "payment_method": "COD",
      "total_items": 3
    }
  ]
}
```

---

### 3. Get Order Details
**GET** `/api/orders/:orderId`

Lấy chi tiết đơn hàng cụ thể.

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order_id": 1,
    "created_date": "2025-12-08",
    "status": "Pending",
    "total": 150000,
    "shipping_fee": 30000,
    "point_earned": 15,
    "point_used": 0,
    "note": "Giao hàng vào buổi sáng",
    "payment_method": "COD",
    "products": [
      {
        "product_id": 10,
        "product_name": "Sample Book",
        "price": 60000,
        "quantity": 2,
        "subtotal": 120000,
        "image_url": "http://example.com/image.jpg"
      }
    ]
  }
}
```

---

### 4. Cancel Order
**PUT** `/api/orders/:orderId/cancel`

Hủy đơn hàng.

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## Order Statuses

- `Pending`: Đơn hàng mới tạo, chờ xử lý
- `Cancelled`: Đơn hàng đã hủy
- `Processing`: Đang xử lý (có thể mở rộng)
- `Shipped`: Đã giao hàng (có thể mở rộng)
- `Delivered`: Đã nhận hàng (có thể mở rộng)

---

## Notes

- Hệ thống tự động tính điểm tích lũy: 1 điểm cho mỗi 10,000 VND
- Phí giao hàng mặc định là 30,000 VND
- Phương thức thanh toán mặc định là COD (Cash on Delivery)
- Sau khi tạo đơn hàng thành công, giỏ hàng sẽ được xóa tự động
- Số lượng tồn kho được cập nhật ngay khi tạo đơn hàng
