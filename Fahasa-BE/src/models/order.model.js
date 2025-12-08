const { getConnection, sql } = require('../config/database');

class OrderModel {
    // Create a new order from cart items
    static async createOrder(customerId, orderData) {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Create Payment record (giả định bỏ qua thanh toán thực tế)
            const paymentResult = await transaction.request()
                .input('customer_id', sql.Int, customerId)
                .input('payment_method', sql.VarChar(50), orderData.payment_method || 'COD')
                .input('created_date', sql.Date, new Date())
                .query(`
                    INSERT INTO Payment (customer_id, payment_method, created_date)
                    OUTPUT INSERTED.payment_id
                    VALUES (@customer_id, @payment_method, @created_date)
                `);

            const paymentId = paymentResult.recordset[0].payment_id;

            // Calculate totals
            const shipping_fee = orderData.shipping_fee || 0;
            const point_used = orderData.point_used || 0;
            const subtotal = orderData.subtotal || 0;
            const total = subtotal + shipping_fee;
            const point_earned = Math.floor(total / 10000); // 1 điểm cho mỗi 10,000 VND

            // Create Order record
            const orderResult = await transaction.request()
                .input('payment_id', sql.Int, paymentId)
                .input('shipping_fee', sql.Decimal(12, 2), shipping_fee)
                .input('note', sql.NVarChar(sql.MAX), orderData.note || null)
                .input('created_date', sql.Date, new Date())
                .input('status', sql.VarChar(50), 'Pending')
                .input('point_earned', sql.Int, point_earned)
                .input('point_used', sql.Int, point_used)
                .input('total', sql.Decimal(12, 2), total)
                .query(`
                    INSERT INTO Orders (payment_id, shipping_fee, note, created_date, status, point_earned, point_used, total)
                    OUTPUT INSERTED.order_id
                    VALUES (@payment_id, @shipping_fee, @note, @created_date, @status, @point_earned, @point_used, @total)
                `);

            const orderId = orderResult.recordset[0].order_id;

            // Insert order products from cart items
            for (const item of orderData.items) {
                await transaction.request()
                    .input('order_id', sql.Int, orderId)
                    .input('product_id', sql.Int, item.product_id)
                    .input('quantity', sql.Int, item.quantity)
                    .query(`
                        INSERT INTO Order_Product (order_id, product_id, quantity)
                        VALUES (@order_id, @product_id, @quantity)
                    `);

                // Update product stock
                await transaction.request()
                    .input('product_id', sql.Int, item.product_id)
                    .input('quantity', sql.Int, item.quantity)
                    .query(`
                        UPDATE Product
                        SET stock_quantity = stock_quantity - @quantity
                        WHERE product_id = @product_id
                    `);
            }

            // Update customer points
            await transaction.request()
                .input('customer_id', sql.Int, customerId)
                .input('point_earned', sql.Int, point_earned)
                .input('point_used', sql.Int, point_used)
                .query(`
                    UPDATE Customer
                    SET total_fpoint = total_fpoint + @point_earned - @point_used
                    WHERE user_id = @customer_id
                `);

            // Clear the cart
            const cartResult = await transaction.request()
                .input('customer_id', sql.Int, customerId)
                .query('SELECT cart_id FROM Cart WHERE customer_id = @customer_id');

            if (cartResult.recordset.length > 0) {
                const cartId = cartResult.recordset[0].cart_id;
                await transaction.request()
                    .input('cart_id', sql.NVarChar(20), cartId)
                    .query('DELETE FROM Cart_Product WHERE cart_id = @cart_id');
            }

            await transaction.commit();

            return {
                order_id: orderId,
                payment_id: paymentId,
                total,
                point_earned,
                status: 'Pending'
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Get order details by order ID
    static async getOrderById(orderId, customerId) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('order_id', sql.Int, orderId)
            .input('customer_id', sql.Int, customerId)
            .query(`
                SELECT 
                    o.order_id,
                    o.created_date,
                    o.status,
                    o.total,
                    o.shipping_fee,
                    o.point_earned,
                    o.point_used,
                    o.note,
                    p.payment_method
                FROM Orders o
                INNER JOIN Payment p ON o.payment_id = p.payment_id
                WHERE o.order_id = @order_id AND p.customer_id = @customer_id
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const order = result.recordset[0];

        // Get order products
        const productsResult = await pool.request()
            .input('order_id', sql.Int, orderId)
            .query(`
                SELECT 
                    op.product_id,
                    p.title as product_name,
                    p.price,
                    op.quantity,
                    (op.quantity * p.price) as subtotal,
                    (SELECT TOP 1 image_url FROM Product_Image WHERE product_id = p.product_id) as image_url
                FROM Order_Product op
                INNER JOIN Product p ON op.product_id = p.product_id
                WHERE op.order_id = @order_id
            `);

        order.products = productsResult.recordset;

        return order;
    }

    // Get all orders for a customer
    static async getOrdersByCustomerId(customerId) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('customer_id', sql.Int, customerId)
            .query(`
                SELECT 
                    o.order_id,
                    o.created_date,
                    o.status,
                    o.total,
                    o.shipping_fee,
                    p.payment_method,
                    COUNT(op.product_id) as total_items
                FROM Orders o
                INNER JOIN Payment p ON o.payment_id = p.payment_id
                LEFT JOIN Order_Product op ON o.order_id = op.order_id
                WHERE p.customer_id = @customer_id
                GROUP BY o.order_id, o.created_date, o.status, o.total, o.shipping_fee, p.payment_method
                ORDER BY o.order_id DESC, o.created_date DESC
            `);

        return result.recordset;
    }

    // Update order status
    static async updateOrderStatus(orderId, customerId, status) {
        const pool = await getConnection();

        // Verify order belongs to customer
        const verifyResult = await pool.request()
            .input('order_id', sql.Int, orderId)
            .input('customer_id', sql.Int, customerId)
            .query(`
                SELECT o.order_id
                FROM Orders o
                INNER JOIN Payment p ON o.payment_id = p.payment_id
                WHERE o.order_id = @order_id AND p.customer_id = @customer_id
            `);

        if (verifyResult.recordset.length === 0) {
            return null;
        }

        const result = await pool.request()
            .input('order_id', sql.Int, orderId)
            .input('status', sql.VarChar(50), status)
            .query(`
                UPDATE Orders
                SET status = @status
                WHERE order_id = @order_id
            `);

        return result.rowsAffected[0] > 0;
    }
}

module.exports = OrderModel;
