import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const DB_PATH = process.env.DATABASE_PATH || './data/yalla-market.sqlite';

const dbFile = path.resolve(process.cwd(), DB_PATH);
const db = new DatabaseSync(dbFile);
const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

if (existing) {
  db.prepare(
    `UPDATE users
     SET full_name = ?, password_hash = ?, role = 'admin'
     WHERE id = ?`
  ).run(ADMIN_NAME, passwordHash, existing.id);

  console.log(`Admin already exists (id=${existing.id}) - credentials updated.`);
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('Login at /login and go to /admin');
  db.close();
  process.exit(0);
}

db.prepare(
  `INSERT INTO users (full_name, email, phone, password_hash, role)
   VALUES (?, ?, ?, ?, 'admin')`
).run(ADMIN_NAME, normalizedEmail, '', passwordHash);

console.log('Admin user created successfully.');
console.log(`  Email   : ${ADMIN_EMAIL}`);
console.log(`  Password: ${ADMIN_PASSWORD}`);
console.log('Login at /login and go to /admin');

db.close();
