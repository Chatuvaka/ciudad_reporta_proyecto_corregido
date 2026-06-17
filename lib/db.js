import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (pool) return pool;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  const useSsl = process.env.DB_SSL === 'true' || (process.env.DB_SSL_MODE && process.env.DB_SSL_MODE.toUpperCase() !== 'DISABLED');

  const ssl = useSsl ? { rejectUnauthorized: false } : undefined;

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ssl,
  });

  return pool;
}

export async function query(sql, params = []) {
  const p = getPool();
  return p.query(sql, params);
}
