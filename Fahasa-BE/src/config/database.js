const sql = require('mssql/msnodesqlv8');

// SQL Server Configuration - sử dụng msnodesqlv8 driver
const config = {
  connectionString: process.env.DB_CONNECTION_STRING ||
    "Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-HKBU7T1M;Database=fahasa;Trusted_Connection=yes;"
};

let pool = null;

const getConnection = async () => {
  try {
    if (!pool) {
      console.log('🔄 Đang kết nối đến database...');
      pool = await sql.connect(config);
      console.log('✅ Kết nối database thành công!');
    }
    return pool;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    throw err;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
};

module.exports = {
  getConnection,
  getPool: getConnection, // Alias for compatibility
  closeConnection,
  sql
};
