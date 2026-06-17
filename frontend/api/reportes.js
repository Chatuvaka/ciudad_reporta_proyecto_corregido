const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool;
function getPool() {
  if (pool) return pool;

  const sslMode = process.env.DB_SSL_MODE;
  let sslOptions;
  if (sslMode && sslMode.toUpperCase() !== 'DISABLED') {
    sslOptions = { rejectUnauthorized: sslMode.toUpperCase() === 'VERIFY_IDENTITY' };
    if (process.env.DB_SSL_CA) {
      const p = path.resolve(process.env.DB_SSL_CA);
      if (fs.existsSync(p)) sslOptions.ca = fs.readFileSync(p, 'utf8');
      else sslOptions.ca = process.env.DB_SSL_CA;
    }
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: sslOptions,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return pool;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM reportes ORDER BY fecha_creacion DESC');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error querying reportes:', err);
    res.status(500).json({ error: 'db_error', message: err.message });
  }
};
