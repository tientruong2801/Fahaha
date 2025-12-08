const { getConnection, sql } = require('../config/database');

class CartModel {
    // Get user's cart
    static async getCartByUserId(userId) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('customer_id', sql.Int, userId)
            .query(`
        SELECT 
          cp.cart_id,
          cp.product_id,
          p.title as product_name,
          p.price,
          p.stock_quantity,
          cp.quantity,
          (SELECT TOP 1 image_url FROM Product_Image WHERE product_id = p.product_id) as image_url,
          (SELECT TOP 1 c.category_name 
           FROM Category_Product cat_p 
           INNER JOIN Category c ON cat_p.category_id = c.category_id 
           WHERE cat_p.product_id = p.product_id) as category_name
        FROM Cart c
        INNER JOIN Cart_Product cp ON c.cart_id = cp.cart_id
        INNER JOIN Product p ON cp.product_id = p.product_id
        WHERE c.customer_id = @customer_id
      `);
        return result.recordset;
    }

    // Get or create cart for user
    static async getOrCreateCart(userId) {
        const pool = await getConnection();

        // Check if cart exists
        let result = await pool.request()
            .input('customer_id', sql.Int, userId)
            .query('SELECT cart_id FROM Cart WHERE customer_id = @customer_id');

        if (result.recordset.length > 0) {
            return result.recordset[0].cart_id;
        }

        // Create new cart with a unique cart_id (max 20 chars)
        const timestamp = Date.now().toString().substring(5); // Last 8 digits
        const random = Math.random().toString(36).substring(2, 7); // 5 chars
        const newCartId = `C${userId}-${timestamp}${random}`.substring(0, 20);
        result = await pool.request()
            .input('cart_id', sql.NVarChar(20), newCartId)
            .input('customer_id', sql.Int, userId)
            .input('quantity', sql.Int, 0)
            .query('INSERT INTO Cart (cart_id, customer_id, quantity) OUTPUT INSERTED.cart_id VALUES (@cart_id, @customer_id, @quantity)');

        return result.recordset[0].cart_id;
    }

    // Add product to cart
    static async addProduct(userId, productId, quantity) {
        try {
            console.log('🛒 CartModel.addProduct called with:', { userId, productId, quantity });
            const pool = await getConnection();
            const cartId = await this.getOrCreateCart(userId);
            console.log('✅ Cart ID obtained:', cartId);

            // Check if product already in cart
            const existing = await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('product_id', sql.Int, productId)
                .query(`
        SELECT product_id 
        FROM Cart_Product 
        WHERE cart_id = @cart_id AND product_id = @product_id
      `);

            if (existing.recordset.length > 0) {
                console.log('ℹ️ Product already in cart - updating quantity');
                // Product exists - update quantity
                await pool.request()
                    .input('cart_id', sql.NVarChar(20), cartId)
                    .input('product_id', sql.Int, productId)
                    .input('quantity', sql.Int, quantity)
                    .query(`
          UPDATE Cart_Product 
          SET quantity = quantity + @quantity 
          WHERE cart_id = @cart_id AND product_id = @product_id
        `);
                console.log('✅ Product quantity updated');
                return { cart_id: cartId, product_id: productId };
            } else {
                console.log('➕ Inserting new product into cart');
                // Insert new product with quantity
                await pool.request()
                    .input('cart_id', sql.NVarChar(20), cartId)
                    .input('product_id', sql.Int, productId)
                    .input('quantity', sql.Int, quantity)
                    .query(`
          INSERT INTO Cart_Product (cart_id, product_id, quantity) 
          VALUES (@cart_id, @product_id, @quantity)
        `);

                // Update total cart quantity
                await pool.request()
                    .input('cart_id', sql.NVarChar(20), cartId)
                    .input('quantity', sql.Int, quantity)
                    .query(`
          UPDATE Cart 
          SET quantity = quantity + @quantity 
          WHERE cart_id = @cart_id
        `);

                console.log('✅ Product added successfully');
                return { cart_id: cartId, product_id: productId };
            }
        } catch (error) {
            console.error('❌ Error in CartModel.addProduct:', error);
            throw error;
        }
    }

    // Remove product from cart
    static async removeProduct(userId, productId) {
        try {
            console.log('🗑️ CartModel.removeProduct called with:', { userId, productId });
            const pool = await getConnection();
            const cartId = await this.getOrCreateCart(userId);
            console.log('Cart ID for removal:', cartId);

            // Get current quantity before deleting
            const currentItem = await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('product_id', sql.Int, productId)
                .query('SELECT quantity FROM Cart_Product WHERE cart_id = @cart_id AND product_id = @product_id');

            const removedQuantity = currentItem.recordset[0]?.quantity || 0;

            // Delete product from cart
            const deleteResult = await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('product_id', sql.Int, productId)
                .query('DELETE FROM Cart_Product WHERE cart_id = @cart_id AND product_id = @product_id');

            console.log('Delete result:', deleteResult);

            // Update total cart quantity
            await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('removed_qty', sql.Int, removedQuantity)
                .query(`
              UPDATE Cart 
              SET quantity = CASE WHEN quantity >= @removed_qty THEN quantity - @removed_qty ELSE 0 END 
              WHERE cart_id = @cart_id
            `);

            console.log('✅ Product removed successfully');
            return true;
        } catch (error) {
            console.error('❌ Error in CartModel.removeProduct:', error);
            throw error;
        }
    }

    // Update product quantity in cart
    static async updateQuantity(userId, productId, quantity) {
        try {
            console.log('🔄 CartModel.updateQuantity called with:', { userId, productId, quantity });
            const pool = await getConnection();
            const cartId = await this.getOrCreateCart(userId);

            if (quantity <= 0) {
                console.log('Quantity <= 0, removing product');
                return await this.removeProduct(userId, productId);
            }

            // Get current quantity
            const currentItem = await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('product_id', sql.Int, productId)
                .query('SELECT quantity FROM Cart_Product WHERE cart_id = @cart_id AND product_id = @product_id');

            if (currentItem.recordset.length === 0) {
                console.log('Product not in cart');
                return { success: false, message: 'Product not in cart' };
            }

            const oldQuantity = currentItem.recordset[0].quantity;
            const quantityDiff = quantity - oldQuantity;

            // Update product quantity
            await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('product_id', sql.Int, productId)
                .input('quantity', sql.Int, quantity)
                .query(`
          UPDATE Cart_Product 
          SET quantity = @quantity 
          WHERE cart_id = @cart_id AND product_id = @product_id
        `);

            // Update total cart quantity
            await pool.request()
                .input('cart_id', sql.NVarChar(20), cartId)
                .input('diff', sql.Int, quantityDiff)
                .query(`
          UPDATE Cart 
          SET quantity = quantity + @diff 
          WHERE cart_id = @cart_id
        `);

            console.log('✅ Quantity updated successfully');
            return { productId, quantity };
        } catch (error) {
            console.error('❌ Error in CartModel.updateQuantity:', error);
            throw error;
        }
    }

    // Clear cart
    static async clearCart(userId) {
        const pool = await getConnection();
        const cartId = await this.getOrCreateCart(userId);

        await pool.request()
            .input('cart_id', sql.NVarChar(20), cartId)
            .query('DELETE FROM Cart_Product WHERE cart_id = @cart_id');

        // Reset cart quantity to 0
        await pool.request()
            .input('cart_id', sql.NVarChar(20), cartId)
            .query('UPDATE Cart SET quantity = 0 WHERE cart_id = @cart_id');

        return true;
    }
}

module.exports = CartModel;
