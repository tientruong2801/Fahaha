USE master;
GO

IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'fahasa')
BEGIN
    CREATE DATABASE fahasa;
END
GO

USE fahasa;
GO

------1-----
CREATE TABLE Users
(
    user_id INT PRIMARY KEY IDENTITY(100,1),
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    fname NVARCHAR(50) NOT NULL,
    lname NVARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    note NVARCHAR(MAX),
    created_date DATE,

    CONSTRAINT CHK_User_CreatedDate CHECK (created_date <= GETDATE())
);

------2-----
CREATE TABLE Staff
(
    user_id INT PRIMARY KEY,
    branch NVARCHAR(100),
    hired_date DATE,
    salary DECIMAL(12,2),
    is_admin BIT DEFAULT 0,

    CONSTRAINT FK_Staff_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT CHK_Staff_Salary CHECK (salary >= 0)
);

-----3-----
CREATE TABLE Customer
(
    user_id INT PRIMARY KEY,
    member_type NVARCHAR(50),
    total_fpoint INT DEFAULT 0,
    CONSTRAINT FK_Customer_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-----4-----
CREATE TABLE User_phone
(
    user_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, phone),
    CONSTRAINT FK_UserPhone_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-----5-----
CREATE TABLE User_address
(
    user_id INT NOT NULL,
    address NVARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, address),
    CONSTRAINT FK_UserAddress_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-----6-----
CREATE TABLE Payment
(
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_date DATE,
    CONSTRAINT FK_Payment_Customer FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

-----7-----
CREATE TABLE Orders
(
    order_id INT PRIMARY KEY IDENTITY(1,1),
    payment_id INT,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    note NVARCHAR(MAX),
    created_date DATE,
    status VARCHAR(50),
    point_earned INT DEFAULT 0,
    point_used INT DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,

    CONSTRAINT FK_Order_Payment FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    CONSTRAINT CHK_Order_Total CHECK (total >= 0)
);

-----8-----
CREATE TABLE Voucher
(
    voucher_code VARCHAR(50) PRIMARY KEY,
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_time DATETIME,
    end_time DATETIME,
    min_order_value DECIMAL(12,2),
    max_sale_value DECIMAL(12,2),
    discount DECIMAL(10, 2) NOT NULL,

    CONSTRAINT CHK_Voucher_Time CHECK (start_time < end_time),
    CONSTRAINT CHK_Voucher_Values CHECK (min_order_value >= 0 AND max_sale_value >= 0 AND discount >= 0)
);

-----9-----
CREATE TABLE Order_Voucher
(
    order_id INT,
    voucher_code VARCHAR(50),
    PRIMARY KEY (order_id, voucher_code),
    CONSTRAINT FK_OV_Order FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CONSTRAINT FK_OV_Voucher FOREIGN KEY (voucher_code) REFERENCES Voucher(voucher_code)
);

-----10-----
CREATE TABLE Cart
(
    cart_id NVARCHAR(20) PRIMARY KEY,
    quantity INT,
    customer_id INT NOT NULL,

    CONSTRAINT FK_Cart_Customer FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

-----11-----
CREATE TABLE Product
(
    product_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    publisher NVARCHAR(100) NOT NULL,
    supplier NVARCHAR(100),
    description NVARCHAR(MAX),
    year INT,
    language NVARCHAR(50),
    product_type NVARCHAR(50),
    stock_quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    weight DECIMAL(10, 2),
    size VARCHAR(2),

    CONSTRAINT CHK_Product_Price CHECK (price >= 0),
    CONSTRAINT CHK_Product_Stock CHECK (stock_quantity >= 0)
);

-----12-----
CREATE TABLE Author_of_product
(
    product_id INT NOT NULL,
    author_name NVARCHAR(50) NOT NULL,
    PRIMARY KEY (product_id, author_name),

    CONSTRAINT FK_Au_Product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-----13-----
CREATE TABLE Order_Product
(
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id),

    CONSTRAINT FK_OP_Order FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CONSTRAINT FK_OP_Product FOREIGN KEY (product_id) REFERENCES Product(product_id),
    CONSTRAINT CHK_OP_Quantity CHECK (quantity > 0)
);

-----14-----
CREATE TABLE Cart_Product
(
    cart_id NVARCHAR(20),
    product_id INT,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_id, product_id),

    CONSTRAINT FK_CP_Cart FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
    CONSTRAINT FK_CP_Product FOREIGN KEY (product_id) REFERENCES Product(product_id),
    CONSTRAINT CHK_Cart_Product_Quantity CHECK (quantity > 0)
);

-----15-----
CREATE TABLE ProductReview
(
    review_id INT IDENTITY(1,1),
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text NVARCHAR(MAX),
    review_date DATETIME,
    image_url VARCHAR(255),
    PRIMARY KEY (product_id, review_id),

    CONSTRAINT FK_PR_Product FOREIGN KEY (product_id) REFERENCES Product(product_id),
    CONSTRAINT FK_PR_Customer FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

-----16-----
CREATE TABLE Product_Image
(
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    ordinal_number INT,
    upload_date DATETIME,
    PRIMARY KEY (product_id, image_url),

    CONSTRAINT FK_PI_Product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-----17-----
CREATE TABLE FlashSale
(
    sale_id INT PRIMARY KEY,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    description NVARCHAR(MAX),

    CONSTRAINT CHK_Flashsale_Time CHECK (start_time < end_time)
);

-----18-----
CREATE TABLE Flashsale_Product
(
    sale_id INT,
    product_id INT,
    discount_value DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (sale_id, product_id),

    CONSTRAINT FK_FSP_Flashsale FOREIGN KEY (sale_id) REFERENCES FlashSale(sale_id),
    CONSTRAINT FK_FSP_Product FOREIGN KEY (product_id) REFERENCES Product(product_id),
    CONSTRAINT CHK_FSP_Values CHECK (discount_value >= 0 AND quantity >= 0)
);

-----19-----
CREATE TABLE Category
(
    category_id INT PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX)
);

-----20-----
CREATE TABLE Categorizes
(
    categoryA_id INT NOT NULL,
    categoryB_id INT PRIMARY KEY,

    CONSTRAINT FK_Cg_CategoryA FOREIGN KEY (categoryA_id) REFERENCES Category(category_id),
    CONSTRAINT FK_Cg_CategoryB FOREIGN KEY (categoryB_id) REFERENCES Category(category_id),
    CONSTRAINT CHK_Categorizes_SelfRef CHECK (categoryA_id <> categoryB_id)
);

-----21-----
CREATE TABLE Category_Product
(
    category_id INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (category_id, product_id),

    CONSTRAINT FK_CtP_Category FOREIGN KEY (category_id) REFERENCES Category(category_id),
    CONSTRAINT FK_CtP_Product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-----22-----
CREATE TABLE Shipment
(
    ship_code VARCHAR(50) PRIMARY KEY,
    shipping_unit VARCHAR(100) NOT NULL,
    tracking_num VARCHAR(100),
    weight DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL,
    last_update DATETIME2,
    shipping_address NVARCHAR(50),
    note NVARCHAR(MAX),

    CONSTRAINT CHK_Shipment_Weight CHECK (weight >= 0)
);

-----23-----
CREATE TABLE Shipment_Order
(
    ship_code VARCHAR(50) PRIMARY KEY,
    order_id INT,

    CONSTRAINT FK_SO_Shipment FOREIGN KEY (ship_code) REFERENCES Shipment(ship_code),
    CONSTRAINT FK_SO_Order FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);


-- 1 -- USERS 
SET IDENTITY_INSERT Users ON;
INSERT INTO Users
    (user_id, username, password, fname, lname, email, created_date)
VALUES
    --- khách hàng
    (101, 'khachhang_A', 'pass123', N'Nguyễn Văn', N'A', 'nguyen.a@example.com', '2023-01-15'),
    (102, 'khachhang_B', 'pass123', N'Trần Thị', N'B', 'tran.b@example.com', '2023-03-20'),
    (103, 'khachhang_C', 'pass123', N'Lê Hoàng', N'C', 'le.c@example.com', '2024-01-10'),
    (104, 'khachhang_D', 'pass123', N'Phạm Minh', N'D', 'pham.d@example.com', '2024-05-01'),
    (105, 'khachhang_E', 'pass123', N'Võ Thanh', N'E', 'vo.e@example.com', '2024-06-12'),
    (111, 'khachhang_F', 'pass123', N'Đinh Tuấn', N'F', 'dinh.f@example.com', '2024-07-20'),
    (112, 'khachhang_G', 'pass123', N'Lý Mỹ', N'G', 'ly.g@example.com', '2024-08-01'),
    (113, 'khachhang_H', 'pass123', N'Trương Công', N'H', 'truong.h@example.com', '2024-09-05'),
    --staff
    (106, 'staff_manager', 'adminpass', N'Đỗ Văn', N'F', 'do.f@fahasa.com', '2022-10-01'),
    (107, 'staff_sales', 'staffpass', N'Hoàng Thị', N'G', 'hoang.g@fahasa.com', '2023-05-15'),
    (108, 'staff_warehouse', 'staffpass', N'Bùi Xuân', N'H', 'bui.h@fahasa.com', '2023-08-22'),
    (109, 'staff_support', 'staffpass', N'Dương Văn', N'I', 'duong.i@fahasa.com', '2024-02-14'),
    (110, 'staff_packing', 'staffpass', N'Mai Thị', N'K', 'mai.k@fahasa.com', '2024-04-10'),
    (114, 'staff_online', 'staffpass', N'Ngô Gia', N'L', 'ngo.l@fahasa.com', '2024-06-01'),
    (115, 'staff_qc', 'staffpass', N'Trịnh Thị', N'M', 'trinh.m@fahasa.com', '2024-10-10');
SET IDENTITY_INSERT Users OFF;
-- 2 -- STAFF 
INSERT INTO Staff
    (user_id, branch, hired_date, salary, is_admin)
VALUES
    (106, N'Chi nhánh Q.1', '2022-10-01', 50000000.00, 1),
    (107, N'Chi nhánh Q.1', '2023-05-15', 15000000.00, 0),
    (108, N'Kho Thủ Đức', '2023-08-22', 12000000.00, 0),
    (109, N'Trụ sở chính', '2024-02-14', 18000000.00, 0),
    (110, N'Kho Thủ Đức', '2024-04-10', 11000000.00, 0),
    (114, N'Chi nhánh Q.1', '2024-06-01', 14000000.00, 0),
    (115, N'Kho Thủ Đức', '2024-10-10', 10500000.00, 0);

-- 3 -- CUSTOMER
INSERT INTO Customer
    (user_id, member_type, total_fpoint)
VALUES
    (101, 'Gold', 1500),
    (102, 'Silver', 500),
    (103, 'Diamond', 3500),
    (104, 'Silver', 200),
    (105, 'Gold', 1000),
    (111, 'Silver', 0),
    (112, 'Gold', 1200),
    (113, 'Silver', 150);

-- 4 -- USER_PHONE  
INSERT INTO User_phone
    (user_id, phone)
VALUES
    (101, '0901234567'),
    (101, '0909999999'),
    (102, '0912345678'),
    (106, '0987654321'),
    (110, '0977666555'),
    (103, '0963214567'),
    (104, '0945781234'),
    (111, '0933221100'),
    (112, '0988776655'),
    (114, '0911223344');

-- 5 -- USER_ADDRESS  
INSERT INTO User_address
    (user_id, address)
VALUES
    (101, N'123 Đường Nguyễn Huệ, Quận 1, TP.HCM'),
    (102, N'45/6 Đường Hậu Giang, Quận 6, TP.HCM'),
    (103, N'Tòa nhà A, Đường Phan Văn Trị, Gò Vấp'),
    (104, N'300 Ký Con, Quận 1, TP.HCM'),
    (105, N'Căn hộ B, Đường 3/2, Quận 10, TP.HCM'),
    (106, N'Trụ sở chính, Quận 1'),
    (107, N'50 Đinh Tiên Hoàng, Quận 1'),
    (111, N'Chung cư S, Đường Lê Văn Việt, TP Thủ Đức'),
    (112, N'Làng Đại Học, Thủ Đức'),
    (113, N'100 Cao Thắng, Quận 3, TP.HCM');

-- 6 -- PAYMENT     
SET IDENTITY_INSERT Payment ON;
INSERT INTO Payment
    (payment_id, customer_id, payment_method, created_date)
VALUES
    (1, 101, 'Credit Card', '2024-11-10'),
    (2, 102, 'COD', '2024-11-11'),
    (3, 103, 'E-Wallet', '2024-11-12'),
    (4, 104, 'Credit Card', '2024-11-13'),
    (5, 105, 'COD', '2024-11-14'),
    (6, 111, 'COD', '2024-11-15'),
    (7, 101, 'E-Wallet', '2024-11-16'),
    (8, 112, 'Credit Card', '2024-11-17'),
    (9, 103, 'COD', '2024-11-18'),
    (10, 113, 'E-Wallet', '2024-11-19');
SET IDENTITY_INSERT Payment OFF;

-- 7 -- ORDERS  
INSERT INTO Orders
    (payment_id, shipping_fee, created_date, status, point_earned, point_used, total)
VALUES
    (1, 15000.00, '2024-11-10', 'Completed', 250, 0, 250000.00),
    (2, 0.00, '2024-11-11', 'Completed', 0, 0, 85000.00),
    (3, 20000.00, '2024-11-12', 'Pending', 0, 500, 370000.00),
    (4, 0.00, '2024-11-13', 'Cancelled', 0, 0, 100000.00),
    (5, 30000.00, '2024-11-14', 'Completed', 500, 0, 500000.00),
    (6, 20000.00, '2024-11-15', 'Completed', 100, 0, 150000.00),
    (7, 0.00, '2024-11-16', 'Completed', 1000, 0, 1000000.00),
    (8, 15000.00, '2024-11-17', 'Pending', 0, 100, 285000.00),
    (9, 30000.00, '2024-11-18', 'Completed', 150, 0, 180000.00),
    (10, 10000.00, '2024-11-19', 'Cancelled', 0, 0, 50000.00);

-- 8 -- VOUCHER     
INSERT INTO Voucher
    (voucher_code, usage_limit, used_count, start_time, end_time, min_order_value, max_sale_value, discount)
VALUES
    ('FREE_SHIP', 500, 10, '2024-10-01 00:00:00', '2025-01-01 23:59:59', 150000.00, 30000.00, 15000.00),
    ('SALE_10K', 1000, 50, '2024-11-20 00:00:00', '2024-12-31 23:59:59', 100000.00, 10000.00, 10000.00),
    ('VIP_20', 50, 5, '2024-11-01 00:00:00', '2025-11-01 23:59:59', 500000.00, 50000.00, 20000.00),
    ('NO_MIN_01', 200, 150, '2024-05-01 00:00:00', '2024-12-31 23:59:59', 0.00, 5000.00, 5000.00),
    ('FLASH_50', 20, 0, '2024-12-01 10:00:00', '2024-12-01 12:00:00', 300000.00, 50000.00, 50000.00),
    ('LOYAL_CUS', 100, 20, '2024-10-01 00:00:00', '2025-03-31 23:59:59', 250000.00, 30000.00, 15000.00),
    ('NEW_USER', 500, 100, '2024-01-01 00:00:00', '2025-01-31 23:59:59', 50000.00, 15000.00, 10000.00),
    ('XMAS_2024', 1000, 0, '2024-12-15 00:00:00', '2024-12-25 23:59:59', 150000.00, 25000.00, 15000.00),
    ('BIG_SAVE', 50, 0, '2024-11-01 00:00:00', '2024-12-31 23:59:59', 800000.00, 100000.00, 50000.00);

-- 9 -- ORDER_VOUCHER   
INSERT INTO Order_Voucher
    (order_id, voucher_code)
VALUES
    (1, 'FREE_SHIP'),
    (5, 'VIP_20'),
    (6, 'NEW_USER'),
    (7, 'LOYAL_CUS'),
    (8, 'FREE_SHIP'),
    (9, 'SALE_10K'),
    (10, 'NO_MIN_01');

-- 10 -- CART   
INSERT INTO Cart
    (cart_id, quantity, customer_id)
VALUES
    ('C-104', 3, 104),
    ('C-105', 1, 105),
    ('C-101', 5, 101),
    ('C-111', 2, 111),
    ('C-113', 1, 113);

-- 11 -- PRODUCT    
SET IDENTITY_INSERT Product ON;
INSERT INTO Product
    (product_id, title, publisher, supplier, year, product_type, stock_quantity, price)
VALUES
    (1, N'Đắc Nhân Tâm', N'NXB Tổng Hợp TP.HCM', N'First News', 2020, N'softcover', 150, 100000.00),
    (2, N'Nhà Giả Kim', N'NXB Văn Học', N'Alpha Books', 2018, N'softcover', 80, 85000.00),
    (3, N'Thuật Tương Đối', N'NXB Khoa Học', N'Mekong Books', 2022, N'hardcover', 20, 250000.00),
    (4, N'Sổ Tay Kế Toán', N'NXB Tài Chính', N'Tài Chính Group', 2023, N'softcover', 5, 120000.00),
    (5, N'One Piece Vol 100', N'NXB Kim Đồng', N'Kim Đồng', 2024, N'softcover', 300, 25000.00),
    (6, N'Tiếng Anh Giao Tiếp Cấp Tốc', N'NXB Giáo Dục', N'Giáo Dục HN', 2024, N'softcover', 200, 75000.00),
    (7, N'Tam thể', N'NXB Hà Nội', N'Nhã Nam', 2025, N'softcover', 200, 150000.00),
    (8, N'Tâm Lý Học Về Tiền', N'NXB Lao Động', N'Minh Long', 2021, N'hardcover', 60, 150000.00),
    (9, N'Doraemon Vol 1', N'NXB Kim Đồng', N'Kim Đồng', 2024, N'softcover', 120, 20000.00),
    (10, N'Lịch Sử Việt Nam', N'NXB Chính Trị Quốc Gia', N'Việt Nam Books', 2019, N'hardcover', 40, 350000.00);
SET IDENTITY_INSERT Product OFF;

-- 12 -- AUTHOR_OF_PRODUCT 
INSERT INTO Author_of_product
    (product_id, author_name)
VALUES
    (1, 'Dale Carnegie'),
    (2, 'Paulo Coelho'),
    (3, 'Albert Einstein'),
    (4, 'Trần Minh Quang'),
    (5, 'Eiichiro Oda'),
    (6, 'Nguyễn Hoàng'),
    (7, 'Nguyễn Văn A'),
    (8, 'Morgan Housel'),
    (9, 'Fujiko F. Fujio'),
    (10, 'Nhiều Tác Giả');

-- 13 -- ORDER_PRODUCT 
INSERT INTO Order_Product
    (order_id, product_id, quantity)
VALUES
    (1, 1, 2),
    (1, 5, 2),
    (2, 2, 1),
    (3, 3, 1),
    (3, 4, 1),
    (4, 1, 1),
    (5, 3, 2),
    (6, 6, 2),
    (7, 10, 2),
    (7, 3, 2),
    (8, 6, 3),
    (9, 1, 1);

-- 14. CART_PRODUCT 
INSERT INTO Cart_Product
    (cart_id, product_id)
VALUES
    ('C-104', 1),
    ('C-104', 2),
    ('C-104', 4),
    ('C-105', 5),
    ('C-105', 3),
    ('C-101', 6),
    ('C-101', 7),
    ('C-111', 8),
    ('C-111', 9),
    ('C-113', 6);

-- 15. PRODUCT_REVIEW (Chuẩn hóa: Sử dụng PK tổng hợp hoặc tự tăng)
-- Chỉ được đánh giá khi Order.status = 'Completed' (Order 1, 2, 5, 7, 9)

INSERT INTO ProductReview
    (product_id, customer_id, rating, review_text, review_date)
VALUES
    (1, 101, 5, N'Sách hay, giao hàng nhanh.', '2024-11-12 15:00:00'),
    (5, 101, 4, N'Truyện đẹp, đóng gói cẩn thận.', '2024-11-12 16:30:00'),
    (2, 102, 5, N'Bản dịch tuyệt vời.', '2024-11-13 10:00:00'),
    (3, 105, 5, N'Mua tặng sếp, sếp rất thích.', '2024-11-15 08:00:00'),
    (3, 101, 5, N'Sách nguyên seal, rất hài lòng.', '2024-11-18 11:40:00'),
    (1, 103, 5, N'Giao hàng hơi chậm, nhưng sách chất lượng.', '2024-11-20 14:00:00');

-- 16 -- PRODUCT_IMAGE 
INSERT INTO Product_Image
    (product_id, image_url, ordinal_number, upload_date)
VALUES
    (1, 'https://cdn1.fahasa.com/media/catalog/product/d/n/dntttttuntitled.jpg', 1, '2023-01-01 10:00:00'),
    (2, 'https://salt.tikicdn.com/cache/w300/ts/product/94/f3/02/6f7d976eb70207763f546caa740112d6.png', 1, '2023-01-05 10:00:00'),
    (3, 'https://salt.tikicdn.com/cache/w300/ts/product/cb/89/63/8c2dd3bea7ea38c1a7953ef69f317425.jpg', 1, '2023-02-01 10:00:00'),
    (4, 'https://cdn1.fahasa.com/media/catalog/product/k/e/ke-toan-bang-hinh-anh-bia-1.jpg', 1, '2023-03-01 10:00:00'),
    (5, 'https://salt.tikicdn.com/cache/w300/ts/product/50/fa/10/47694066a36e51763671ce34f9d04a2f.jpg', 1, '2023-04-01 10:00:00'),
    (6, 'https://cdn1.fahasa.com/media/catalog/product/s/a/sach-hoc-tieng-anh-cap-toc---tap-1.jpg', 1, '2024-05-10 10:00:00'),
    (7, 'https://salt.tikicdn.com/cache/w300/ts/product/11/d0/1a/7a59eae47d7c2de1557410b306d0c71a.png', 1, '2024-05-15 10:00:00'),
    (8, 'https://salt.tikicdn.com/cache/550x550/media/catalog/product/product/83/23/b7/14a42ae4f66c9b8b298aaef4b9671442.jpg', 1, '2024-06-01 10:00:00'),
    (9, 'https://cdn1.fahasa.com/media/catalog/product/i/m/image_80104.jpg', 1, '2024-06-15 10:00:00'),
    (10, 'https://cdn1.fahasa.com/media/catalog/product/l/i/lich-su-viet-nam.jpg', 1, '2024-07-01 10:00:00');

-- 17 -- FLASH SALE     
INSERT INTO FlashSale
    (sale_id, start_time, end_time, description)
VALUES
    (1, '2024-11-20 18:00:00', '2024-11-20 20:00:00', N'Sale Black Friday 2 tiếng'),
    (2, '2024-12-12 00:00:00', '2024-12-12 23:59:59', N'Sale 12.12'),
    (3, '2024-12-05 10:00:00', '2024-12-05 14:00:00', N'Giữa tháng giảm sâu'),
    (4, '2024-12-24 18:00:00', '2024-12-25 00:00:00', N'Sale Giáng Sinh'),
    (5, '2024-10-20 00:00:00', '2024-10-20 23:59:59', N'Sale 20/10');

-- 18 -- FLASH SALE PRODUCT 
INSERT INTO Flashsale_Product
    (sale_id, product_id, discount_value, quantity)
VALUES
    (1, 1, 10000.00, 50),
    (1, 2, 8500.00, 30),
    (2, 5, 5000.00, 100),
    (2, 4, 12000.00, 10),
    (2, 3, 25000.00, 5),
    (3, 8, 15000.00, 20),
    (3, 6, 5000.00, 50),
    (4, 1, 10000.00, 40),
    (5, 7, 500.00, 100),
    (5, 5, 2500.00, 50);

-- 19 -- CATEGORY 
INSERT INTO Category
    (category_id, category_name)
VALUES
    (1, N'Sách Trong Nước'),
    (2, N'Văn Học'),
    (3, N'Kinh Tế'),
    (4, N'Văn Phòng Phẩm'),
    (5, N'Truyện Tranh'),
    (6, N'Sách Ngoại Văn'),
    (7, N'Khoa Học'),
    (8, N'Tâm Lý - Kỹ Năng'),
    (9, N'Sách Lịch Sử'),
    (10, N'Thiếu Nhi');

-- 20 -- CATEGORIZES    
INSERT INTO Categorizes
    (categoryA_id, categoryB_id)
VALUES
    (1, 2),
    (1, 3),
    (1, 7),
    (1, 8),
    (1, 9),
    (2, 6),
    (5, 10);

-- 21 -- CATEGORY_PRODUCT 
INSERT INTO Category_Product
    (category_id, product_id)
VALUES
    (2, 1),
    (2, 2),
    (3, 4),
    (5, 5),
    (1, 3),
    (8, 1),
    (8, 8),
    (7, 3),
    (10, 9),
    (9, 10);

-- 22 -- SHIPMENT   
INSERT INTO Shipment
    (ship_code, shipping_unit, status, last_update, shipping_address, weight)
VALUES
    ('S-1001', 'GHN', 'Delivered', '2024-11-12 10:00:00', N'123 Đường Nguyễn Huệ, Quận 1', 1.50),
    ('S-1002', 'GHTK', 'Shipping', '2024-11-12 15:30:00', N'45/6 Đường Hậu Giang, Quận 6', 0.80),
    ('S-1003', 'Viettel Post', 'Received', '2024-11-13 09:00:00', N'Tòa nhà A, Gò Vấp', 2.10),
    ('S-1004', 'GHN', 'Pending', '2024-11-15 11:00:00', N'Căn hộ B, Quận 10', 3.20),
    ('S-1005', 'GHTK', 'Shipping', '2024-11-15 16:00:00', N'Tòa nhà A, Gò Vấp', 0.75),
    ('S-1006', 'J&T Express', 'Delivered', '2024-11-17 14:00:00', N'Chung cư S, Thủ Đức', 0.90),
    ('S-1007', 'GHN', 'Delivered', '2024-11-18 10:00:00', N'123 Đường Nguyễn Huệ, Quận 1', 5.00),
    ('S-1008', 'GHTK', 'Shipping', '2024-11-19 12:00:00', N'Làng Đại Học, Thủ Đức', 1.20),
    ('S-1009', 'Viettel Post', 'Delivered', '2024-11-20 16:00:00', N'Tòa nhà A, Gò Vấp', 1.50),
    ('S-1010', 'GHN', 'Cancelled', '2024-11-20 17:00:00', N'100 Cao Thắng, Quận 3', 0.50);


-- 23 -- SHIPMENT_ORDER     
INSERT INTO Shipment_Order
    (ship_code, order_id)
VALUES
    ('S-1001', 1),
    ('S-1002', 2),
    ('S-1003', 3),
    ('S-1004', 5),
    ('S-1005', 4),
    ('S-1006', 6),
    ('S-1007', 7),
    ('S-1008', 8),
    ('S-1009', 9),
    ('S-1010', 10);


-- 2.1. Thủ tục thêm, sửa, xóa cho bảng Product

-- INSERT Product
IF OBJECT_ID('sp_InsertProduct', 'P') IS NOT NULL
    DROP PROCEDURE sp_InsertProduct;
GO

CREATE PROCEDURE sp_InsertProduct
    @Title NVARCHAR(255),
    @Publisher NVARCHAR(100),
    @Supplier NVARCHAR(100) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Year INT = NULL,
    @Language NVARCHAR(50) = NULL,
    @ProductType NVARCHAR(50) = NULL,
    @StockQuantity INT,
    @Price DECIMAL(12,2),
    @Weight DECIMAL(10,2) = NULL,
    @Size VARCHAR(2) = NULL
AS
BEGIN
    -- Validate dữ liệu
    IF @Title IS NULL OR LEN(@Title) = 0
    BEGIN
        RAISERROR(N'Tiêu đề sản phẩm không được để trống.', 16, 1);
        RETURN;
    END

    IF @Publisher IS NULL OR LEN(@Publisher) = 0
    BEGIN
        RAISERROR(N'Nhà xuất bản không được để trống.', 16, 1);
        RETURN;
    END

    IF @StockQuantity < 0
    BEGIN
        RAISERROR(N'Số lượng tồn kho phải >= 0.', 16, 1);
        RETURN;
    END

    IF @Price < 0
    BEGIN
        RAISERROR(N'Giá sản phẩm phải >= 0.', 16, 1);
        RETURN;
    END

    IF @Year IS NOT NULL AND @Year <= 0
    BEGIN
        RAISERROR(N'Năm xuất bản phải > 0 nếu được cung cấp.', 16, 1);
        RETURN;
    END

    IF @Size IS NOT NULL AND LEN(@Size) != 2
    BEGIN
        RAISERROR(N'Kích thước phải có đúng 2 ký tự nếu được cung cấp.', 16, 1);
        RETURN;
    END

    -- Thêm sản phẩm
    INSERT INTO Product
        (title, publisher, supplier, description, year, language, product_type, stock_quantity, price, weight, size)
    VALUES
        (@Title, @Publisher, @Supplier, @Description, @Year, @Language, @ProductType, @StockQuantity, @Price, @Weight, @Size);

    PRINT N'Sản phẩm đã được thêm thành công.';
END;
GO

-- UPDATE Product
IF OBJECT_ID('sp_UpdateProduct', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateProduct;
GO

CREATE PROCEDURE sp_UpdateProduct
    @ProductID INT,
    @Title NVARCHAR(255) = NULL,
    @Publisher NVARCHAR(100) = NULL,
    @Supplier NVARCHAR(100) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Year INT = NULL,
    @Language NVARCHAR(50) = NULL,
    @ProductType NVARCHAR(50) = NULL,
    @StockQuantity INT = NULL,
    @Price DECIMAL(12,2) = NULL,
    @Weight DECIMAL(10,2) = NULL,
    @Size VARCHAR(2) = NULL
AS
BEGIN
    -- Kiểm tra sản phẩm tồn tại
    IF NOT EXISTS (SELECT 1
    FROM Product
    WHERE product_id = @ProductID)
    BEGIN
        RAISERROR(N'Sản phẩm với ID %d không tồn tại.', 16, 1, @ProductID);
        RETURN;
    END

    -- Validate dữ liệu nếu được cung cấp
    IF @Title IS NOT NULL AND LEN(@Title) = 0
    BEGIN
        RAISERROR(N'Tiêu đề sản phẩm không được để trống.', 16, 1);
        RETURN;
    END

    IF @StockQuantity IS NOT NULL AND @StockQuantity < 0
    BEGIN
        RAISERROR(N'Số lượng tồn kho phải >= 0.', 16, 1);
        RETURN;
    END

    IF @Price IS NOT NULL AND @Price < 0
    BEGIN
        RAISERROR(N'Giá sản phẩm phải >= 0.', 16, 1);
        RETURN;
    END

    IF @Year IS NOT NULL AND @Year <= 0
    BEGIN
        RAISERROR(N'Năm xuất bản phải > 0.', 16, 1);
        RETURN;
    END

    IF @Size IS NOT NULL AND LEN(@Size) != 2
    BEGIN
        RAISERROR(N'Kích thước phải có đúng 2 ký tự.', 16, 1);
        RETURN;
    END

    -- Cập nhật sản phẩm
    UPDATE Product
    SET title = ISNULL(@Title, title),
        publisher = ISNULL(@Publisher, publisher),
        supplier = ISNULL(@Supplier, supplier),
        description = ISNULL(@Description, description),
        year = ISNULL(@Year, year),
        language = ISNULL(@Language, language),
        product_type = ISNULL(@ProductType, product_type),
        stock_quantity = ISNULL(@StockQuantity, stock_quantity),
        price = ISNULL(@Price, price),
        weight = ISNULL(@Weight, weight),
        size = ISNULL(@Size, size)
    WHERE product_id = @ProductID;

    PRINT N'Sản phẩm đã được cập nhật thành công.';
END;
GO

-- DELETE Product
IF OBJECT_ID('sp_DeleteProduct', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteProduct;
GO

CREATE PROCEDURE sp_DeleteProduct
    @ProductID INT
AS
BEGIN
    -- Kiểm tra sản phẩm tồn tại
    IF NOT EXISTS (SELECT 1
    FROM Product
    WHERE product_id = @ProductID)
    BEGIN
        RAISERROR(N'Sản phẩm với ID %d không tồn tại.', 16, 1, @ProductID);
        RETURN;
    END

    -- Kiểm tra xem sản phẩm có trong Order_Product không (đã được bán)
    IF EXISTS (SELECT 1
    FROM Order_Product
    WHERE product_id = @ProductID)
    BEGIN
        RAISERROR(N'Không thể xóa sản phẩm vì đã có đơn hàng liên quan. Sản phẩm này đã được bán.', 16, 1);
        RETURN;
    END

    -- Kiểm tra các bảng liên quan khác nếu cần (như Cart_Product, Flashsale_Product, v.v.)
    IF EXISTS (SELECT 1
    FROM Cart_Product
    WHERE product_id = @ProductID)
    BEGIN
        RAISERROR(N'Không thể xóa sản phẩm vì có trong giỏ hàng.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1
    FROM Flashsale_Product
    WHERE product_id = @ProductID)
    BEGIN
        RAISERROR(N'Không thể xóa sản phẩm vì có trong chương trình flash sale.', 16, 1);
        RETURN;
    END

    -- Xóa sản phẩm (không có CASCADE)
    DELETE FROM Product_Image WHERE product_id = @ProductID;
    DELETE FROM ProductReview WHERE product_id = @ProductID;
    DELETE FROM Author_of_product WHERE product_id = @ProductID;
    DELETE FROM Category_Product WHERE product_id = @ProductID;

    DELETE FROM Product WHERE product_id = @ProductID;

    PRINT N'Sản phẩm đã được xóa thành công và ID đã được reset.';
END;
GO

-- Thủ tục thêm, sửa, xóa cho bảng Users

-- INSERT User
IF OBJECT_ID('sp_RegisterUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_RegisterUser;
GO

CREATE PROCEDURE sp_RegisterUser
    @Username VARCHAR(50),
    @Password VARCHAR(100),
    @Fname NVARCHAR(50),
    @Lname NVARCHAR(50),
    @Email VARCHAR(100),
    @Phone VARCHAR(20) = NULL,
    @UserID INT OUTPUT
AS
BEGIN
    -- Validate dữ liệu
    IF @Username IS NULL OR LEN(@Username) = 0
    BEGIN
        RAISERROR(N'Tên đăng nhập không được để trống.', 16, 1);
        RETURN;
    END

    IF @Password IS NULL OR LEN(@Password) = 0
    BEGIN
        RAISERROR(N'Mật khẩu không được để trống.', 16, 1);
        RETURN;
    END

    IF @Fname IS NULL OR LEN(@Fname) = 0
    BEGIN
        RAISERROR(N'Họ không được để trống.', 16, 1);
        RETURN;
    END

    IF @Lname IS NULL OR LEN(@Lname) = 0
    BEGIN
        RAISERROR(N'Tên không được để trống.', 16, 1);
        RETURN;
    END

    IF @Email IS NULL OR LEN(@Email) = 0
    BEGIN
        RAISERROR(N'Email không được để trống.', 16, 1);
        RETURN;
    END

    -- Kiểm tra email duy nhất
    IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        RAISERROR(N'Email đã tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra username duy nhất
    IF EXISTS (SELECT 1 FROM Users WHERE username = @Username)
    BEGIN
        RAISERROR(N'Tên đăng nhập đã tồn tại.', 16, 1);
        RETURN;
    END

    -- Thêm user và lấy user_id
    INSERT INTO Users (username, password, fname, lname, email, created_date)
    VALUES (@Username, @Password, @Fname, @Lname, @Email, GETDATE());

    SET @UserID = SCOPE_IDENTITY();

    -- Tạo customer profile
    INSERT INTO Customer (user_id, member_type, total_fpoint)
    VALUES (@UserID, 'Basic', 0);

    -- Nếu có phone, thêm vào User_phone
    IF @Phone IS NOT NULL AND LEN(@Phone) > 0
    BEGIN
        INSERT INTO User_phone (user_id, phone)
        VALUES (@UserID, @Phone);
    END

    PRINT N'Người dùng đã được đăng ký thành công.';
END;
GO

-- UPDATE User
IF OBJECT_ID('sp_UpdateUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateUser;
GO

CREATE PROCEDURE sp_UpdateUser
    @UserID INT,
    @Username VARCHAR(50) = NULL,
    @Password VARCHAR(100) = NULL,
    @Fname NVARCHAR(50) = NULL,
    @Lname NVARCHAR(50) = NULL,
    @Email VARCHAR(100) = NULL,
    @Note NVARCHAR(MAX) = NULL
AS
BEGIN
    -- Kiểm tra user tồn tại
    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @UserID)
    BEGIN
        RAISERROR(N'Người dùng với ID %d không tồn tại.', 16, 1, @UserID);
        RETURN;
    END

    -- Validate dữ liệu nếu được cung cấp
    IF @Username IS NOT NULL AND LEN(@Username) = 0
    BEGIN
        RAISERROR(N'Tên đăng nhập không được để trống.', 16, 1);
        RETURN;
    END

    IF @Password IS NOT NULL AND LEN(@Password) = 0
    BEGIN
        RAISERROR(N'Mật khẩu không được để trống.', 16, 1);
        RETURN;
    END

    IF @Fname IS NOT NULL AND LEN(@Fname) = 0
    BEGIN
        RAISERROR(N'Họ không được để trống.', 16, 1);
        RETURN;
    END

    IF @Lname IS NOT NULL AND LEN(@Lname) = 0
    BEGIN
        RAISERROR(N'Tên không được để trống.', 16, 1);
        RETURN;
    END

    IF @Email IS NOT NULL AND LEN(@Email) = 0
    BEGIN
        RAISERROR(N'Email không được để trống.', 16, 1);
        RETURN;
    END

    -- Kiểm tra email duy nhất nếu thay đổi
    IF @Email IS NOT NULL AND EXISTS (SELECT 1 FROM Users WHERE email = @Email AND user_id != @UserID)
    BEGIN
        RAISERROR(N'Email đã tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra username duy nhất nếu thay đổi
    IF @Username IS NOT NULL AND EXISTS (SELECT 1 FROM Users WHERE username = @Username AND user_id != @UserID)
    BEGIN
        RAISERROR(N'Tên đăng nhập đã tồn tại.', 16, 1);
        RETURN;
    END

    -- Cập nhật user
    UPDATE Users
    SET username = ISNULL(@Username, username),
        password = ISNULL(@Password, password),
        fname = ISNULL(@Fname, fname),
        lname = ISNULL(@Lname, lname),
        email = ISNULL(@Email, email),
        note = ISNULL(@Note, note)
    WHERE user_id = @UserID;

    PRINT N'Người dùng đã được cập nhật thành công.';
END;
GO

-- DELETE User
IF OBJECT_ID('sp_DeleteUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteUser;
GO

CREATE PROCEDURE sp_DeleteUser
    @UserID INT
AS
BEGIN
    -- Kiểm tra user tồn tại
    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @UserID)
    BEGIN
        RAISERROR(N'Người dùng với ID %d không tồn tại.', 16, 1, @UserID);
        RETURN;
    END

    -- Kiểm tra xem user có trong Staff không
    IF EXISTS (SELECT 1 FROM Staff WHERE user_id = @UserID)
    BEGIN
        RAISERROR(N'Không thể xóa người dùng vì là nhân viên.', 16, 1);
        RETURN;
    END

    -- Kiểm tra xem user có trong Customer không
    IF EXISTS (SELECT 1 FROM Customer WHERE user_id = @UserID)
    BEGIN
        -- Kiểm tra đơn hàng
        IF EXISTS (SELECT 1 FROM Payment WHERE customer_id = @UserID)
        BEGIN
            RAISERROR(N'Không thể xóa người dùng vì có đơn hàng liên quan.', 16, 1);
            RETURN;
        END
    END

    -- Xóa từ các bảng liên quan
    DELETE FROM User_address WHERE user_id = @UserID;
    DELETE FROM User_phone WHERE user_id = @UserID;
    DELETE FROM Customer WHERE user_id = @UserID;

    -- Xóa user
    DELETE FROM Users WHERE user_id = @UserID;

    PRINT N'Người dùng đã được xóa thành công.';
END;
GO


-----2.2.1. Trigger kiểm tra ràng buộc ngữ nghĩa------
------Mô tả: Trigger này dùng để kiểm tra ràng buộc khách hàng chỉ được phép đánh giá sản phẩm khi họ đã mua nó và đơn hàng đã hoàn tất-------
IF OBJECT_ID('trg_CheckReview_Cursor', 'TR') IS NOT NULL
    DROP TRIGGER trg_CheckReview_Cursor;
GO

CREATE OR ALTER TRIGGER check_ProductReview
ON ProductReview 
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @customerID INT;
    DECLARE @ProductID INT;

    DECLARE cur1 CURSOR FOR 
    SELECT customer_id, product_id
    FROM INSERTED

    OPEN cur1
    FETCH NEXT FROM cur1 INTO @customerID, @ProductID

    WHILE @@FETCH_STATUS = 0 
    BEGIN
        IF NOT EXISTS (
            SELECT 1
        FROM Orders o
            JOIN Payment p ON o.payment_id = p.payment_id
            JOIN Order_Product op ON o.order_id = op.order_id
        WHERE p.customer_id = @customerID AND op.product_id = @productID AND o.status = 'Completed'
        )
        BEGIN
            DECLARE @Message VARCHAR(255)
            SET @Message = N'Error: Customer ' + CAST(@customerID AS VARCHAR) + N' has not purchased the product ' + CAST(@productID AS VARCHAR) + N' or this order has not completed yet.'
            RAISERROR(@Message, 16, 1)
            ROLLBACK TRANSACTION

            CLOSE cur1
            DEALLOCATE cur1
            RETURN
        END
        FETCH NEXT FROM cur1 INTO @customerID, @productID
    END
    CLOSE cur1
    DEALLOCATE cur1
END


IF OBJECT_ID('sp_GetMonthlyRevenue', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetMonthlyRevenue;
GO

CREATE PROCEDURE sp_GetMonthlyRevenue
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MONTH(created_date) as [Month],
        COUNT(order_id) as [TotalOrders],
        SUM(total) as [TotalRevenue]
    FROM Orders
    WHERE YEAR(created_date) = @Year 
      AND status IN ('Completed', 'Paid')
    GROUP BY MONTH(created_date)
    ORDER BY [Month];
END;
GO


IF OBJECT_ID('sp_GetTopSellingProducts', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetTopSellingProducts;
GO

CREATE PROCEDURE sp_GetTopSellingProducts
    @TopN INT = 5,
    @Month INT = NULL,
    @Year INT = NULL,
    @MinQuantity INT = 1 
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@TopN)
        p.product_id,
        p.title,
        SUM(op.quantity) as [TotalSold],
        SUM(op.quantity * p.price) as [RevenueGenerated]
    FROM Product p                                      -- Bảng 1
    JOIN Order_Product op ON p.product_id = op.product_id -- Bảng 2 (Liên kết)
    JOIN Orders o ON op.order_id = o.order_id           -- Bảng 3 (Liên kết)
    
    -- 1. WHERE: Lọc dữ liệu đầu vào (Thời gian, trạng thái)
    WHERE o.status IN ('Completed', 'Paid')
      AND (@Month IS NULL OR MONTH(o.created_date) = @Month)
      AND (@Year IS NULL OR YEAR(o.created_date) = @Year)
    
    -- 2. GROUP BY: Gom nhóm theo sản phẩm
    GROUP BY p.product_id, p.title, p.price
    
    -- 3. HAVING: Lọc SAU khi gom nhóm (Yêu cầu bắt buộc)
    -- Chỉ lấy những nhóm sản phẩm có tổng số lượng bán >= @MinQuantity
    HAVING SUM(op.quantity) >= @MinQuantity
    
    -- 4. ORDER BY: Sắp xếp giảm dần
    ORDER BY [TotalSold] DESC;
END;
GO
-- Tìm top 5 sản phẩm bán chạy tháng 11/2024
-- Điều kiện: Tổng số lượng bán phải >= 2 cuốn (HAVING sẽ hoạt động ở đây)
EXEC sp_GetTopSellingProducts 
    @TopN = 5, 
    @Month = 11, 
    @Year = 2024,
    @MinQuantity = 2;



-- TÍNH TỔNG TIỀN KHÁCH ĐÃ CHI TIÊU 
-- duyệt qua từng đơn hàng 'completed' của khách để cộng dồn tiền
GO
CREATE OR ALTER FUNCTION fn_CalcTotalSpending
    (@CustomerID INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @TotalSpending DECIMAL(12,2) = 0;
    DECLARE @OrderTotal DECIMAL(12,2);
    
    -- kiểm tra tham số đầu vào
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE user_id = @CustomerID)
        RETURN 0; -- trả về 0 nếu khách không tồn tại

    DECLARE cur_Orders CURSOR FOR
        SELECT O.total 
        FROM Orders O
        JOIN Payment P ON O.payment_id = P.payment_id
        WHERE P.customer_id = @CustomerID 
          AND O.status = 'completed'; -- chỉ tính đơn thành công

    -- duyệt
    OPEN cur_Orders;
    FETCH NEXT FROM cur_Orders INTO @OrderTotal;

    -- dùng loop tính tổng
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @TotalSpending = @TotalSpending + @OrderTotal;
        FETCH NEXT FROM cur_Orders INTO @OrderTotal;
    END

    -- dọn dẹp
    CLOSE cur_Orders;
    DEALLOCATE cur_Orders;

    RETURN @TotalSpending;
END;
GO


-- TÍNH CHI PHÍ NHẬP HÀNG BỔ SUNG 
-- duyệt từng sách trong danh mục, nếu tồn kho < ngưỡng thì tính tiền nhập thêm cho đủ 50 cuốn
GO
CREATE OR ALTER FUNCTION fn_CalcRestockCost
    (@CategoryID INT, @MinStockThreshold INT)
RETURNS DECIMAL(15,2)
AS
BEGIN
    DECLARE @TotalCost DECIMAL(15,2) = 0;
    DECLARE @CurrentStock INT;
    DECLARE @ImportPrice DECIMAL(12,2);
    DECLARE @TargetStock INT = 50; -- định mức kho an toàn

    -- check tham số đầu vào
    IF NOT EXISTS (SELECT 1 FROM Category WHERE category_id = @CategoryID)
        RETURN -1; -- trả về -1 để báo lỗi danh mục không tồn tại

    DECLARE cur_Products CURSOR FOR
        SELECT P.stock_quantity, P.price
        FROM Product P
        JOIN Category_Product CP ON P.product_id = CP.product_id
        WHERE CP.category_id = @CategoryID;

    -- duyệt
    OPEN cur_Products;
    FETCH NEXT FROM cur_Products INTO @CurrentStock, @ImportPrice;

    -- loop
    WHILE @@FETCH_STATUS = 0
    BEGIN
        --chỉ nhập hàng nếu tồn kho dưới ngưỡng
        IF @CurrentStock < @MinStockThreshold
        BEGIN
            -- giả sử giá nhập = 70% giá bán
            SET @TotalCost = @TotalCost + ((@TargetStock - @CurrentStock) * (@ImportPrice * 0.7));
        END

        FETCH NEXT FROM cur_Products INTO @CurrentStock, @ImportPrice;
    END

    CLOSE cur_Products;
    DEALLOCATE cur_Products;

    RETURN @TotalCost;
END;
GO

