import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { imageNeedsReplacement, resolveProductImage } from '../utils/productImages.js';

const dbPath = path.resolve(process.cwd(), 'data/yalla-market.sqlite');
const db = new DatabaseSync(dbPath);

const rows = db.prepare('SELECT id, name, name_en, image, category_id FROM products').all();
const updateStmt = db.prepare('UPDATE products SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

let updated = 0;

for (const row of rows) {
  if (imageNeedsReplacement(row.image)) {
    updateStmt.run(resolveProductImage(row), row.id);
    updated += 1;
  }
}

console.log(`Updated product images: ${updated}`);

db.close();
