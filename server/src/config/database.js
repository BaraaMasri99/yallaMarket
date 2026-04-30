import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { env } from './env.js';

const databaseFile = path.resolve(process.cwd(), env.databasePath);
const databaseDirectory = path.dirname(databaseFile);

fs.mkdirSync(databaseDirectory, { recursive: true });

export const db = new DatabaseSync(databaseFile);

console.log(`SQLite connected at ${databaseFile}`);

export function initializeDatabase() {
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      slug TEXT NOT NULL UNIQUE,
      image TEXT NOT NULL DEFAULT '',
      emoji TEXT NOT NULL DEFAULT '',
      gradient TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  migrateCategoriesTable();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  migrateUsersTable();

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL CHECK(price >= 0),
      unit TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      image TEXT NOT NULL DEFAULT '',
      badge TEXT NOT NULL DEFAULT '',
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      total_price REAL NOT NULL CHECK(total_price >= 0),
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  migrateOrdersTable();

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function migrateCategoriesTable() {
  const columns = db.prepare('PRAGMA table_info(categories)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('emoji')) {
    db.exec("ALTER TABLE categories ADD COLUMN emoji TEXT NOT NULL DEFAULT ''");
  }

  if (!columnNames.has('gradient')) {
    db.exec("ALTER TABLE categories ADD COLUMN gradient TEXT NOT NULL DEFAULT ''");
  }

  if (!columnNames.has('name_en')) {
    db.exec("ALTER TABLE categories ADD COLUMN name_en TEXT NOT NULL DEFAULT ''");
  }
}

function migrateOrdersTable() {
  const columns = db.prepare('PRAGMA table_info(orders)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('payment_method')) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cash'");
  }
}

function migrateUsersTable() {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  const columnNames = new Set(columns.map((column) => column.name));
  const hasLegacyColumns =
    columnNames.has('name') ||
    columnNames.has('password') ||
    columnNames.has('address') ||
    columnNames.has('is_active') ||
    columnNames.has('updated_at');
  const hasAuthColumns = columnNames.has('full_name') && columnNames.has('password_hash');

  if (hasAuthColumns && !hasLegacyColumns) return;

  const fullNameExpression =
    columnNames.has('full_name') && columnNames.has('name')
      ? "COALESCE(full_name, name, '')"
      : columnNames.has('full_name')
        ? "COALESCE(full_name, '')"
        : "COALESCE(name, '')";
  const passwordExpression =
    columnNames.has('password_hash') && columnNames.has('password')
      ? "COALESCE(password_hash, password, '')"
      : columnNames.has('password_hash')
        ? "COALESCE(password_hash, '')"
        : "COALESCE(password, '')";

  db.exec('PRAGMA foreign_keys = OFF');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    INSERT OR IGNORE INTO users_new (id, full_name, email, phone, password_hash, role, created_at)
    SELECT
      id,
      ${fullNameExpression},
      LOWER(TRIM(email)),
      COALESCE(phone, ''),
      ${passwordExpression},
      COALESCE(role, 'customer'),
      COALESCE(created_at, CURRENT_TIMESTAMP)
    FROM users
  `);

  db.exec('DROP TABLE users');
  db.exec('ALTER TABLE users_new RENAME TO users');
  db.exec('PRAGMA foreign_keys = ON');

  const foreignKeyIssues = db.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeyIssues.length > 0) {
    console.warn('SQLite foreign key issues after users migration', foreignKeyIssues);
  }
}
