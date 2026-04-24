import { categories } from '../../../client/data/categories.js';
import { products } from '../../../client/data/products.js';
import { db, initializeDatabase } from '../config/database.js';

initializeDatabase();

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (id, name, slug, image, emoji, gradient)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
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
`);

db.exec('BEGIN');

try {
  for (const category of categories) {
    insertCategory.run(
      category.id,
      category.name,
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
      product.nameEn || '',
      product.description || '',
      product.descriptionEn || '',
      product.price,
      product.unit || '',
      product.inStock === false ? 0 : 25,
      product.image || '',
      product.badge || '',
      product.categoryId
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
