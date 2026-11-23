const oracledb = require('oracledb');

// Configure Oracle driver defaults
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const dbConfig = {
  user: process.env.ORACLE_USER || 'fahaha',
  password: process.env.ORACLE_PASSWORD || 'tiensan1041',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/FREEPDB1'
};

let pool = null;

// Helper to normalize uppercase Oracle column keys to lowercase
function normalizeRows(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(row => {
    if (!row || typeof row !== 'object') return row;
    const res = {};
    for (const k of Object.keys(row)) {
      res[k.toLowerCase()] = row[k];
    }
    return res;
  });
}

// Convert @param to :param in SQL queries
function convertSqlParameters(sql) {
  if (!sql) return sql;
  return sql.replace(/@([a-zA-Z0-9_]+)/g, ':$1');
}

// Request class to provide backward compatibility with mssql Request API
class OracleRequest {
  constructor(connection = null) {
    this.connection = connection;
    this.parameters = {};
    this.binds = {};
  }

  input(name, typeOrValue, maybeValue) {
    const value = maybeValue !== undefined ? maybeValue : typeOrValue;
    this.binds[name] = value;
    this.parameters[name] = { value };
    return this;
  }

  output(name, type) {
    let oracledbType = oracledb.STRING;
    if (type === sql.Int || type === sql.Number) {
      oracledbType = oracledb.NUMBER;
    }
    this.binds[name] = { dir: oracledb.BIND_OUT, type: oracledbType };
    this.parameters[name] = { value: null };
    return this;
  }

  async query(sqlString) {
    let conn = this.connection;
    const shouldClose = !conn;
    try {
      if (!conn) {
        conn = await pool.getConnection();
      }

      // Convert SQL Server parameter format (@param) to Oracle (:param)
      const convertedSql = convertSqlParameters(sqlString);

      // Filter binds to only those present in the SQL text (or pass empty object if none)
      const queryBinds = {};
      for (const [k, v] of Object.entries(this.binds)) {
        const regex = new RegExp(':' + k + '\\b', 'i');
        if (regex.test(convertedSql)) {
          queryBinds[k] = v;
        }
      }

      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: shouldClose // Only autocommit if not in transaction
      };

      const result = await conn.execute(convertedSql, queryBinds, options);
      const rows = normalizeRows(result.rows || []);

      return {
        recordset: rows,
        rowsAffected: [result.rowsAffected || 0]
      };
    } catch (err) {
      console.error('❌ Oracle query error:', err.message);
      console.error('SQL:', sqlString);
      throw err;
    } finally {
      if (shouldClose && conn) {
        try {
          await conn.close();
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }
    }
  }

  async execute(procName) {
    let conn = this.connection;
    const shouldClose = !conn;
    try {
      if (!conn) {
        conn = await pool.getConnection();
      }

      let plsql = '';
      const execBinds = {};

      if (procName === 'sp_RegisterUser') {
        plsql = `
          BEGIN
            sp_RegisterUser(
              :Username,
              :Password,
              :Fname,
              :Lname,
              :Email,
              :Phone,
              :UserID
            );
          END;
        `;
        execBinds.Username = this.binds.Username;
        execBinds.Password = this.binds.Password;
        execBinds.Fname = this.binds.Fname;
        execBinds.Lname = this.binds.Lname;
        execBinds.Email = this.binds.Email;
        execBinds.Phone = this.binds.Phone || null;
        execBinds.UserID = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
      } else if (procName === 'sp_InsertProduct') {
        plsql = `
          BEGIN
            sp_InsertProduct(
              :Title,
              :Publisher,
              :Supplier,
              :Description,
              :Year,
              :Language,
              :ProductType,
              :StockQuantity,
              :Price,
              :Weight,
              :Size
            );
          END;
        `;
        execBinds.Title = this.binds.Title;
        execBinds.Publisher = this.binds.Publisher;
        execBinds.Supplier = this.binds.Supplier || null;
        execBinds.Description = this.binds.Description || null;
        execBinds.Year = this.binds.Year || null;
        execBinds.Language = this.binds.Language || null;
        execBinds.ProductType = this.binds.ProductType || null;
        execBinds.StockQuantity = this.binds.StockQuantity;
        execBinds.Price = this.binds.Price;
        execBinds.Weight = this.binds.Weight || null;
        execBinds.Size = this.binds.Size || null;
      } else if (procName === 'sp_UpdateProduct') {
        plsql = `
          BEGIN
            sp_UpdateProduct(
              :ProductID,
              :Title,
              :Publisher,
              :Supplier,
              :Description,
              :Year,
              :Language,
              :ProductType,
              :StockQuantity,
              :Price,
              :Weight,
              :Size
            );
          END;
        `;
        execBinds.ProductID = this.binds.ProductID;
        execBinds.Title = this.binds.Title || null;
        execBinds.Publisher = this.binds.Publisher || null;
        execBinds.Supplier = this.binds.Supplier || null;
        execBinds.Description = this.binds.Description || null;
        execBinds.Year = this.binds.Year || null;
        execBinds.Language = this.binds.Language || null;
        execBinds.ProductType = this.binds.ProductType || null;
        execBinds.StockQuantity = this.binds.StockQuantity !== undefined ? this.binds.StockQuantity : null;
        execBinds.Price = this.binds.Price !== undefined ? this.binds.Price : null;
        execBinds.Weight = this.binds.Weight || null;
        execBinds.Size = this.binds.Size || null;
      } else if (procName === 'sp_GetTopSellingProducts') {
        plsql = `
          BEGIN
            sp_GetTopSellingProducts(
              :TopN,
              :Month,
              :Year,
              :MinQuantity,
              :cur
            );
          END;
        `;
        execBinds.TopN = this.binds.TopN || 5;
        execBinds.Month = this.binds.Month || null;
        execBinds.Year = this.binds.Year || null;
        execBinds.MinQuantity = this.binds.MinQuantity || 1;
        execBinds.cur = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
      } else if (procName === 'sp_GetMonthlyRevenue') {
        plsql = `
          BEGIN
            sp_GetMonthlyRevenue(
              :Year,
              :cur
            );
          END;
        `;
        execBinds.Year = this.binds.Year;
        execBinds.cur = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
      } else {
        throw new Error(`Procedure ${procName} is not recognized`);
      }

      const result = await conn.execute(plsql, execBinds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: shouldClose
      });

      let recordset = [];
      if (result.outBinds && result.outBinds.cur) {
        const resultSet = result.outBinds.cur;
        const fetchedRows = [];
        let row;
        while ((row = await resultSet.getRow())) {
          fetchedRows.push(row);
        }
        await resultSet.close();
        recordset = normalizeRows(fetchedRows);
      }

      if (result.outBinds && result.outBinds.UserID !== undefined) {
        this.parameters.UserID = { value: result.outBinds.UserID };
      }

      return {
        recordset,
        output: result.outBinds || {}
      };
    } catch (err) {
      console.error(`❌ Oracle execute (${procName}) error:`, err.message);
      throw err;
    } finally {
      if (shouldClose && conn) {
        try {
          await conn.close();
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }
    }
  }
}

// Transaction class to provide backward compatibility with mssql Transaction API
class OracleTransaction {
  constructor() {
    this.connection = null;
  }

  async begin() {
    if (!pool) await initPool();
    this.connection = await pool.getConnection();
    // Do not autocommit during transaction
  }

  request() {
    if (!this.connection) {
      throw new Error('Transaction has not been started. Call begin() first.');
    }
    return new OracleRequest(this.connection);
  }

  async commit() {
    if (this.connection) {
      try {
        await this.connection.commit();
      } finally {
        await this.connection.close();
        this.connection = null;
      }
    }
  }

  async rollback() {
    if (this.connection) {
      try {
        await this.connection.rollback();
      } finally {
        await this.connection.close();
        this.connection = null;
      }
    }
  }
}

// Pool wrapper
const poolWrapper = {
  request() {
    return new OracleRequest(null);
  }
};

async function initPool() {
  if (!pool) {
    console.log('🔄 Đang kết nối đến Oracle Database...');
    pool = await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });
    console.log('✅ Kết nối Oracle Database thành công!');
  }
  return poolWrapper;
}

const getConnection = async () => {
  if (!pool) {
    await initPool();
  }
  return poolWrapper;
};

const closeConnection = async () => {
  if (pool) {
    try {
      await pool.close(10);
      pool = null;
      console.log('Oracle connection pool closed');
    } catch (err) {
      console.error('Error closing Oracle pool:', err);
    }
  }
};

// SQL compatibility types
const sql = {
  Int: 'Int',
  Number: 'Number',
  VarChar: () => 'VarChar',
  NVarChar: () => 'NVarChar',
  Decimal: () => 'Decimal',
  Date: 'Date',
  MAX: 'MAX',
  Transaction: OracleTransaction
};

module.exports = {
  getConnection,
  getPool: getConnection,
  closeConnection,
  sql,
  oracledb
};
