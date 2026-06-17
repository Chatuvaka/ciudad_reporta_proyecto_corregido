import mysql from "mysql2/promise";

const host = process.env.DB_HOST || process.env.AIVEN_HOST || process.env.MYSQL_HOST;
const port = Number(process.env.DB_PORT || process.env.AIVEN_PORT || process.env.MYSQL_PORT || 3306);
const user = process.env.DB_USER || process.env.AIVEN_USER || process.env.MYSQL_USER;
const password = process.env.DB_PASSWORD || process.env.AIVEN_PASSWORD || process.env.MYSQL_PASSWORD;
const database = process.env.DB_NAME || process.env.AIVEN_DB || process.env.MYSQL_DATABASE;

if (!host || !user || !password || !database) {
  console.error('Missing required MySQL env vars:', {
    DB_HOST: host,
    DB_PORT: port,
    DB_USER: user,
    DB_NAME: database,
  });
  throw new Error(
    'Missing required MySQL environment variables. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME.'
  );
}

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;