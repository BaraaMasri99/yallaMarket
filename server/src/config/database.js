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
      slug TEXT NOT NULL UNIQUE,
      image TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
