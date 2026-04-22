import { db } from '../config/database.js';

const publicUserFields = 'id, full_name, email, phone, role, created_at';

export function createUser({ fullName, email, phone = '', passwordHash, role = 'customer' }) {
  const result = db
    .prepare(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(fullName.trim(), normalizeEmail(email), phone.trim(), passwordHash, role);

  return findUserById(result.lastInsertRowid);
}

export function findUserByEmail(email) {
  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(normalizeEmail(email));
}

export function findUserById(id) {
  return db
    .prepare(`SELECT ${publicUserFields} FROM users WHERE id = ?`)
    .get(id);
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
