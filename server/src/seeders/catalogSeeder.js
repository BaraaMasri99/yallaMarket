import { categories, products } from './catalogData.js';
import { db, initializeDatabase } from '../config/database.js';

initializeDatabase();

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, name_en, slug, image, emoji, gradient)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    name_en = excluded.name_en,
    slug = excluded.slug,
    image = excluded.image,
    emoji = excluded.emoji,
    gradient = excluded.gradient,
    updated_at = CURRENT_TIMESTAMP
`);

const insertProduct = db.prepare(`
  INSERT INTO products (
    id,
    name,
    name_en,
    description,
    description_en,
    price,
    unit,
    stock,
    image,
    badge,
    category_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    name_en = excluded.name_en,
    description = excluded.description,
    description_en = excluded.description_en,
    price = excluded.price,
    unit = excluded.unit,
    stock = excluded.stock,
    image = excluded.image,
    badge = excluded.badge,
    category_id = excluded.category_id,
    is_active = 1,
    updated_at = CURRENT_TIMESTAMP
`);

db.exec('BEGIN');

try {
  for (const category of categories) {
    insertCategory.run(
      category.id,
      category.name,
      category.name_en || category.nameEn || '',
      category.slug,
      category.image || '',
      category.emoji || '',
      category.gradient || ''
    );
  }

  for (const product of products) {
    insertProduct.run(
      product.id,
      product.name,
      product.name_en || product.nameEn || '',
      product.description || '',
      product.description_en || product.descriptionEn || '',
      product.price,
      product.unit || '',
      product.stock ?? (product.inStock === false ? 0 : 25),
      product.image || '',
      product.badge || '',
      product.category_id ?? product.categoryId
    );
  }

  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

const counts = {
  categories: db.prepare('SELECT COUNT(*) AS count FROM categories').get().count,
  products: db.prepare('SELECT COUNT(*) AS count FROM products').get().count,
};

console.log('Catalog seeded successfully.');
console.log(`Categories: ${counts.categories}`);
console.log(`Products: ${counts.products}`);

db.close();
