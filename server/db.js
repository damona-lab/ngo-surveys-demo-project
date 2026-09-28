import mysql from 'mysql2/promise';

if (!process.env.DB_PASSWORD && !process.env.MYSQLPASSWORD) {
  throw new Error('Set DB_PASSWORD (or MYSQLPASSWORD) before starting the server.');
}

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'ngo_surveys',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ngo_surveys',
  waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

export default pool;
