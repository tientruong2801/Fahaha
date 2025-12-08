const authService = require('../services/auth.service');

const authController = {
    // Đăng ký
    register: async (req, res) => {
        try {
            const { username, email, password, fname, lname, phone } = req.body;

            if (!username || !email || !password || !fname || !lname) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            const result = await authService.register({
                username,
                email,
                password,
                fname,
                lname,
                phone
            });

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                ...result
            });
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email/Tên đăng nhập và mật khẩu không được để trống'
                });
            }

            const result = await authService.login(email, password);

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                ...result
            });
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message
            });
        }
    },

    // Xác thực token
    verifyToken: (req, res) => {
        res.json({
            success: true,
            valid: true,
            user: req.user
        });
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: async (req, res) => {
        try {
            const user = await authService.getUserById(req.user.user_id);

            res.json({
                success: true,
                data: user
            });
        } catch (err) {
            console.error("Lỗi lấy thông tin user:", err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message
            });
        }
    }
};

module.exports = authController;
