import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const dbName = process.env.DB_NAME || 'realestate';

// DBMS concept: Programmatic schema initialization pre-check
// Establish a direct raw connection without specifying database target to safely assert existence of dbName.
try {
  const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.end();
  console.log(`Database '${dbName}' verified/created successfully.`);
} catch (e) {
  console.warn('MySQL database check warning (make sure credentials are correct):', e.message);
}

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
