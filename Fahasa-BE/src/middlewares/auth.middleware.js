const jwt = require('jsonwebtoken');

// JWT Secret Key (nên dùng process.env.JWT_SECRET trong production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token xác thực'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
    req.user = user;
    next();
  });
};

// Optional authentication - allows both authenticated and unauthenticated requests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Initialize req.user as empty object if not set
  if (!req.user) {
    req.user = {};
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
