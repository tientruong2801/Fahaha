-- PL/SQL procedures and functions for Fahaha

CREATE OR REPLACE PROCEDURE sp_InsertProduct (
    p_title IN VARCHAR2,
    p_publisher IN VARCHAR2,
    p_supplier IN VARCHAR2 DEFAULT NULL,
    p_description IN CLOB DEFAULT NULL,
    p_year IN NUMBER DEFAULT NULL,
    p_language IN VARCHAR2 DEFAULT NULL,
    p_product_type IN VARCHAR2 DEFAULT NULL,
    p_stock_quantity IN NUMBER,
    p_price IN NUMBER,
    p_weight IN NUMBER DEFAULT NULL,
    p_size IN VARCHAR2 DEFAULT NULL
) AS
BEGIN
    IF p_title IS NULL OR LENGTH(TRIM(p_title)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Tiêu đề sản phẩm không được để trống.');
    END IF;
    IF p_publisher IS NULL OR LENGTH(TRIM(p_publisher)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Nhà xuất bản không được để trống.');
    END IF;
    IF p_stock_quantity < 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Số lượng tồn kho phải >= 0.');
    END IF;
    IF p_price < 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Giá sản phẩm phải >= 0.');
    END IF;
    IF p_year IS NOT NULL AND p_year <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Năm xuất bản phải > 0 nếu được cung cấp.');
    END IF;
    IF p_size IS NOT NULL AND LENGTH(p_size) != 2 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Kích thước phải có đúng 2 ký tự nếu được cung cấp.');
    END IF;

    INSERT INTO Product (title, publisher, supplier, description, year, language, product_type, stock_quantity, price, weight, "SIZE")
    VALUES (p_title, p_publisher, p_supplier, p_description, p_year, p_language, p_product_type, p_stock_quantity, p_price, p_weight, p_size);
END;
/

CREATE OR REPLACE PROCEDURE sp_UpdateProduct (
    p_product_id IN NUMBER,
    p_title IN VARCHAR2 DEFAULT NULL,
    p_publisher IN VARCHAR2 DEFAULT NULL,
    p_supplier IN VARCHAR2 DEFAULT NULL,
    p_description IN CLOB DEFAULT NULL,
    p_year IN NUMBER DEFAULT NULL,
    p_language IN VARCHAR2 DEFAULT NULL,
    p_product_type IN VARCHAR2 DEFAULT NULL,
    p_stock_quantity IN NUMBER DEFAULT NULL,
    p_price IN NUMBER DEFAULT NULL,
    p_weight IN NUMBER DEFAULT NULL,
    p_size IN VARCHAR2 DEFAULT NULL
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM Product WHERE product_id = p_product_id;
    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'Sản phẩm không tồn tại.');
    END IF;

    IF p_title IS NOT NULL AND LENGTH(TRIM(p_title)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Tiêu đề sản phẩm không được để trống.');
    END IF;
    IF p_stock_quantity IS NOT NULL AND p_stock_quantity < 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Số lượng tồn kho phải >= 0.');
    END IF;
    IF p_price IS NOT NULL AND p_price < 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Giá sản phẩm phải >= 0.');
    END IF;
    IF p_year IS NOT NULL AND p_year <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Năm xuất bản phải > 0.');
    END IF;
    IF p_size IS NOT NULL AND LENGTH(p_size) != 2 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Kích thước phải có đúng 2 ký tự.');
    END IF;

    UPDATE Product
    SET title = NVL(p_title, title),
        publisher = NVL(p_publisher, publisher),
        supplier = NVL(p_supplier, supplier),
        description = NVL(p_description, description),
        year = NVL(p_year, year),
        language = NVL(p_language, language),
        product_type = NVL(p_product_type, product_type),
        stock_quantity = NVL(p_stock_quantity, stock_quantity),
        price = NVL(p_price, price),
        weight = NVL(p_weight, weight),
        "SIZE" = NVL(p_size, "SIZE")
    WHERE product_id = p_product_id;
END;
/

CREATE OR REPLACE PROCEDURE sp_RegisterUser (
    p_username IN VARCHAR2,
    p_password IN VARCHAR2,
    p_fname IN VARCHAR2,
    p_lname IN VARCHAR2,
    p_email IN VARCHAR2,
    p_phone IN VARCHAR2 DEFAULT NULL,
    p_user_id OUT NUMBER
) AS
    v_count NUMBER;
BEGIN
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'Tên đăng nhập không được để trống.');
    END IF;
    IF p_password IS NULL OR LENGTH(TRIM(p_password)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20011, 'Mật khẩu không được để trống.');
    END IF;
    IF p_fname IS NULL OR LENGTH(TRIM(p_fname)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'Họ không được để trống.');
    END IF;
    IF p_lname IS NULL OR LENGTH(TRIM(p_lname)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20013, 'Tên không được để trống.');
    END IF;
    IF p_email IS NULL OR LENGTH(TRIM(p_email)) = 0 THEN
        RAISE_APPLICATION_ERROR(-20014, 'Email không được để trống.');
    END IF;

    SELECT COUNT(*) INTO v_count FROM Users WHERE email = p_email;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20015, 'Email đã tồn tại.');
    END IF;

    SELECT COUNT(*) INTO v_count FROM Users WHERE username = p_username;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20016, 'Tên đăng nhập đã tồn tại.');
    END IF;

    INSERT INTO Users (username, password, fname, lname, email, created_date)
    VALUES (p_username, p_password, p_fname, p_lname, p_email, TRUNC(SYSDATE))
    RETURNING user_id INTO p_user_id;

    INSERT INTO Customer (user_id, member_type, total_fpoint)
    VALUES (p_user_id, 'Basic', 0);

    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
        INSERT INTO User_phone (user_id, phone)
        VALUES (p_user_id, p_phone);
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE sp_GetMonthlyRevenue (
    p_year IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        EXTRACT(MONTH FROM created_date) as "month",
        COUNT(order_id) as "totalorders",
        SUM(total) as "totalrevenue"
    FROM Orders
    WHERE EXTRACT(YEAR FROM created_date) = p_year 
      AND status IN ('Completed', 'Paid')
    GROUP BY EXTRACT(MONTH FROM created_date)
    ORDER BY "month";
END;
/

CREATE OR REPLACE PROCEDURE sp_GetTopSellingProducts (
    p_top_n IN NUMBER DEFAULT 5,
    p_month IN NUMBER DEFAULT NULL,
    p_year IN NUMBER DEFAULT NULL,
    p_min_quantity IN NUMBER DEFAULT 1,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        p.product_id,
        p.title,
        SUM(op.quantity) as "totalsold",
        SUM(op.quantity * p.price) as "revenuegenerated"
    FROM Product p
    JOIN Order_Product op ON p.product_id = op.product_id
    JOIN Orders o ON op.order_id = o.order_id
    WHERE o.status IN ('Completed', 'Paid')
      AND (p_month IS NULL OR EXTRACT(MONTH FROM o.created_date) = p_month)
      AND (p_year IS NULL OR EXTRACT(YEAR FROM o.created_date) = p_year)
    GROUP BY p.product_id, p.title, p.price
    HAVING SUM(op.quantity) >= NVL(p_min_quantity, 1)
    ORDER BY "totalsold" DESC
    FETCH FIRST NVL(p_top_n, 5) ROWS ONLY;
END;
/

CREATE OR REPLACE FUNCTION fn_CalcTotalSpending (
    p_customer_id IN NUMBER
) RETURN NUMBER AS
    v_total NUMBER(12,2) := 0;
    v_order_total NUMBER(12,2);
    v_exists NUMBER;
    CURSOR cur_orders IS
        SELECT O.total 
        FROM Orders O
        JOIN Payment P ON O.payment_id = P.payment_id
        WHERE P.customer_id = p_customer_id 
          AND LOWER(O.status) = 'completed';
BEGIN
    SELECT COUNT(*) INTO v_exists FROM Customer WHERE user_id = p_customer_id;
    IF v_exists = 0 THEN
        RETURN 0;
    END IF;

    OPEN cur_orders;
    LOOP
        FETCH cur_orders INTO v_order_total;
        EXIT WHEN cur_orders%NOTFOUND;
        v_total := v_total + NVL(v_order_total, 0);
    END LOOP;
    CLOSE cur_orders;

    RETURN v_total;
END;
/

CREATE OR REPLACE FUNCTION fn_CalcRestockCost (
    p_category_id IN NUMBER,
    p_min_stock_threshold IN NUMBER
) RETURN NUMBER AS
    v_total_cost NUMBER(15,2) := 0;
    v_current_stock NUMBER;
    v_import_price NUMBER(12,2);
    v_target_stock NUMBER := 50;
    v_exists NUMBER;
    CURSOR cur_products IS
        SELECT P.stock_quantity, P.price
        FROM Product P
        JOIN Category_Product CP ON P.product_id = CP.product_id
        WHERE CP.category_id = p_category_id;
BEGIN
    SELECT COUNT(*) INTO v_exists FROM Category WHERE category_id = p_category_id;
    IF v_exists = 0 THEN
        RETURN -1;
    END IF;

    OPEN cur_products;
    LOOP
        FETCH cur_products INTO v_current_stock, v_import_price;
        EXIT WHEN cur_products%NOTFOUND;
        IF v_current_stock < p_min_stock_threshold THEN
            v_total_cost := v_total_cost + ((v_target_stock - v_current_stock) * (v_import_price * 0.7));
        END IF;
    END LOOP;
    CLOSE cur_products;

    RETURN v_total_cost;
END;
/

CREATE OR REPLACE TRIGGER check_ProductReview
BEFORE INSERT OR UPDATE ON ProductReview
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM Orders o
    JOIN Payment p ON o.payment_id = p.payment_id
    JOIN Order_Product op ON o.order_id = op.order_id
    WHERE p.customer_id = :NEW.customer_id 
      AND op.product_id = :NEW.product_id 
      AND o.status = 'Completed';

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20020, 'Error: Customer ' || :NEW.customer_id || ' has not purchased the product ' || :NEW.product_id || ' or this order has not completed yet.');
    END IF;
END;
/
