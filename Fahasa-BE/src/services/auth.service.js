const { getConnection, sql } = require('../config/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth.middleware');

const authService = {
    // Đăng ký
    register: async (userData) => {
        try {
            const { username, email, password, fname, lname, phone } = userData;
            const pool = await getConnection();

            // Gọi thủ tục sp_RegisterUser
            const request = pool.request();
            request.input('Username', sql.VarChar, username);
            request.input('Password', sql.VarChar, password);
            request.input('Fname', sql.NVarChar, fname);
            request.input('Lname', sql.NVarChar, lname);
            request.input('Email', sql.VarChar, email);
            request.input('Phone', sql.VarChar, phone);
            request.output('UserID', sql.Int);

            await request.execute('sp_RegisterUser');

            const userId = request.parameters.UserID.value;

            // Tạo JWT token
            const token = jwt.sign(
                {
                    user_id: userId,
                    email: email,
                    role: 'customer',
                    is_admin: false
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return {
                token: token,
                user: {
                    id: userId,
                    username: username,
                    email: email,
                    name: `${fname} ${lname}`,
                    role: 'customer',
                    is_admin: false
                }
            };
        } catch (err) {
            throw err;
        }
    },

    // Đăng nhập
    login: async (email, password) => {
        try {
            const pool = await getConnection();
            const request = pool.request();

            // Tìm user theo email
            request.input('Email', sql.VarChar, email);
            const result = await request.query(`
        SELECT u.user_id, u.username, u.email, u.fname, u.lname,
               CASE 
                   WHEN s.user_id IS NOT NULL THEN 'admin'
                   WHEN c.user_id IS NOT NULL THEN 'customer'
                   ELSE 'user'
               END as role,
               s.is_admin
        FROM Users u
        LEFT JOIN Staff s ON u.user_id = s.user_id
        LEFT JOIN Customer c ON u.user_id = c.user_id
        WHERE u.email = @Email
      `);

            if (result.recordset.length === 0) {
                const error = new Error('Email hoặc mật khẩu không đúng');
                error.status = 401;
                throw error;
            }

            const user = result.recordset[0];

            // Kiểm tra password (trong thực tế nên dùng bcrypt)
            const passwordResult = await pool.request()
                .input('Email', sql.VarChar, email)
                .input('Password', sql.VarChar, password)
                .query('SELECT * FROM Users WHERE email = @Email AND password = @Password');

            if (passwordResult.recordset.length === 0) {
                const error = new Error('Email hoặc mật khẩu không đúng');
                error.status = 401;
                throw error;
            }

            // Tạo JWT token
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    is_admin: user.is_admin
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return {
                token: token,
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    name: `${user.fname} ${user.lname}`,
                    role: user.role,
                    is_admin: user.is_admin
                }
            };
        } catch (err) {
            throw err;
        }
    },

    // Lấy thông tin user theo ID
    getUserById: async (userId) => {
        try {
            const pool = await getConnection();
            const request = pool.request();

            request.input('UserId', sql.Int, userId);
            const result = await request.query(`
        SELECT u.user_id, u.username, u.email, u.fname, u.lname, u.created_date,
               CASE 
                   WHEN s.user_id IS NOT NULL THEN 'admin'
                   WHEN c.user_id IS NOT NULL THEN 'customer'
                   ELSE 'user'
               END as role,
               c.member_type, c.total_fpoint
        FROM Users u
        LEFT JOIN Staff s ON u.user_id = s.user_id
        LEFT JOIN Customer c ON u.user_id = c.user_id
        WHERE u.user_id = @UserId
      `);

            if (result.recordset.length === 0) {
                const error = new Error('Không tìm thấy người dùng');
                error.status = 404;
                throw error;
            }

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }
};

module.exports = authService;
