// backend/index.js
require('dotenv').config();

const app = require('./src/app');
const { getConnection, closeConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Test kết nối database khi khởi động
const testConnection = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 as test FROM dual');
    console.log('✅ Test query thành công:', result.recordset);
    return true;
  } catch (err) {
    console.error('❌ Không thể kết nối đến database:', err.message);
    console.error('💡 Hãy kiểm tra:');
    console.error('   - Oracle Container đang chạy?');
    console.error('   - Thông tin kết nối trong .env đúng?');
    return false;
  }
};

// Khởi động server với kiểm tra kết nối database
const startServer = async () => {
  console.log('🚀 Đang khởi động server...');

  // Test kết nối database trước
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('\n⚠️  CẢNH BÁO: Server sẽ chạy nhưng không thể kết nối database!');
    console.error('⚠️  Tất cả API requests sẽ thất bại.\n');
  }

  // Khởi động Express server
  app.listen(PORT, () => {
    console.log(`\n✅ Backend đang chạy tại http://localhost:${PORT}`);
    console.log(`📚 Xem API docs tại: Fahasa-BE/API_DOCUMENTATION.md\n`);

    if (dbConnected) {
      console.log('🎉 Sẵn sàng phục vụ requests!\n');
    }
  });
};

// Xử lý lỗi khi tắt server
process.on('SIGINT', async () => {
  console.log('\n🛑 Đang tắt server...');
  await closeConnection();
  process.exit(0);
});

// Bắt đầu server
startServer().catch(err => {
  console.error('❌ Lỗi khởi động server:', err);
  process.exit(1);
});
