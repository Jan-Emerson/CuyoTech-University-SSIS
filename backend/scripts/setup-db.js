// Creates the database from db/schema.sql without needing the `mysql` command.
// Usage:  npm run setup-db
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

try {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  await conn.query(sql);
  await conn.end();
  console.log('Database "ssis" created. Next: npm run seed');
} catch (e) {
  if (e.code === 'ECONNREFUSED') {
    console.error('Cannot reach MySQL. Is the MySQL server installed and running? (XAMPP: click Start next to MySQL)');
  } else if (e.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Wrong DB_USER / DB_PASSWORD in your .env file.');
  } else {
    console.error(e.message);
  }
  process.exit(1);
}
