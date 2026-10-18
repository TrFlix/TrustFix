import 'dotenv/config';
import mysql from 'mysql2/promise';

/**
 * Shared MySQL pool. `dateStrings` keeps DATE/DATETIME values as strings so
 * the API never shifts a preferred booking date across timezones.
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustfix',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: 'utf8mb4',
});
