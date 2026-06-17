const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const sslMode = process.env.DB_SSL_MODE;
let sslOptions;
if (sslMode && sslMode.toUpperCase() !== 'DISABLED') {
  sslOptions = {
    rejectUnauthorized: sslMode.toUpperCase() === 'VERIFY_IDENTITY',
  };

  if (process.env.DB_SSL_CA) {
    const sslCaPath = path.resolve(process.env.DB_SSL_CA);
    if (fs.existsSync(sslCaPath)) {
      sslOptions.ca = fs.readFileSync(sslCaPath, 'utf8');
    } else {
      sslOptions.ca = process.env.DB_SSL_CA;
    }
  }
}

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             process.env.DB_PORT     || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'ciudad_reporta',
  ssl:              sslOptions,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

// Verificar conexión al iniciar
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida');
    conn.release();
  } catch (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
