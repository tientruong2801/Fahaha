# Fahasa Database Project

Hệ thống quản lý bán sách trực tuyến Fahasa với backend API và frontend React.

## Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- SQL Server (Express, Developer hoặc Standard)
- ODBC Driver 17 for SQL Server

## Cài đặt

### 1. Cài đặt dependencies

```powershell
# Cài đặt dependencies cho root (concurrently)
npm i

# Cài đặt dependencies cho Backend
cd Fahasa-BE
npm i

# Cài đặt dependencies cho Frontend
cd ..\Fahasa-FE
npm i

# Quay về thư mục gốc
cd ..
```

### 2. Thiết lập SQL Server Database

1. Mở SQL Server Management Studio (SSMS)
2. Mở file `Fahasa-BE/fahasa.sql`
3. Thực thi toàn bộ script để tạo database `fahasa` và các bảng

### 3. Cấu hình kết nối Database

Tạo file `.env` trong thư mục `Fahasa-BE` với nội dung:

```env
PORT=5000
DB_CONNECTION_STRING=Driver={ODBC Driver 17 for SQL Server};Server=TÊN_MÁY_BẠN;Database=fahasa;Trusted_Connection=yes;
JWT_SECRET=your_jwt_secret_key_here
```

**Lưu ý:** Thay `TÊN_MÁY_BẠN` bằng tên máy SQL Server của bạn (ví dụ: `LAPTOP-HKBU7T1M` hoặc `localhost\SQLEXPRESS`)

### 4. Chạy ứng dụng

```powershell
# Chạy cả Backend và Frontend cùng lúc
npm start
```

Hoặc chạy riêng từng phần:

```powershell
# Chỉ chạy Backend (port 5000)
npm run server

# Chỉ chạy Frontend (port 5173)
npm run client
```

## Truy cập ứng dụng

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Cấu trúc dự án

```
BTL2/
├── Fahasa-BE/          # Backend API (Node.js + Express + SQL Server)
│   ├── src/
│   │   ├── config/     # Cấu hình database
│   │   ├── controllers/# Controllers xử lý request
│   │   ├── models/     # Models tương tác với database
│   │   ├── routes/     # Định nghĩa các routes
│   │   ├── services/   # Business logic
│   │   └── middlewares/# Middleware (auth, validation)
│   └── fahasa.sql      # Database schema
└── Fahasa-FE/          # Frontend (React + Vite)
    └── src/
        ├── components/ # React components
        ├── pages/      # Các trang
        ├── api/        # API client
        └── context/    # React Context (Auth)
```
## Tài liệu API

Xem chi tiết tại: `Fahasa-BE/API_DOCUMENTATION.md`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra SQL Server đã chạy chưa
- Đảm bảo đã cài ODBC Driver 17 for SQL Server
- Kiểm tra tên server trong file `.env` chính xác

### Port đã được sử dụng
- Thay đổi PORT trong file `.env` của Backend
- Hoặc tắt ứng dụng đang sử dụng port 5000/5173