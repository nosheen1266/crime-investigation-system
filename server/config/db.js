const sql = require('mssql');

const config = {
  server: 'NOSHEEN-LAPTOP',
  database: 'crime_investigation_db',
  port: 1433,
  user: 'crimesystem',
  password: 'Crime@12345',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };