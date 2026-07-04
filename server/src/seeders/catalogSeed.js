import { db } from '../config/database.js';
import { categories, products } from './catalogData.js';

function createStatements() {
  return {
    insertCategory: db.prepare(`
      INSERT INTO categories (id, name, name_ar, name_en, description_ar, description_en, slug, image, emoji, gradient)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        name_ar = excluded.name_ar,
        name_en = excluded.name_en,
        description_ar = excluded.description_ar,
        description_en = excluded.description_en,
        slug = excluded.slug,
        image = excluded.image,
        emoji = excluded.emoji,
        gradient = excluded.gradient,
        updated_at = CURRENT_TIMESTAMP
    `),
    insertProduct: db.prepare(`
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
    `),
  };
}

export function getCatalogCounts() {
  return {
    categories: db.prepare('SELECT COUNT(*) AS count FROM categories').get().count,
    products: db.prepare('SELECT COUNT(*) AS count FROM products').get().count,
  };
}

export function upsertCatalogData() {
  const { insertCategory, insertProduct } = createStatements();

  db.exec('BEGIN');

  try {
    for (const category of categories) {
      insertCategory.run(
        category.id,
        category.name,
        category.name_ar || category.name || '',
        category.name_en || category.nameEn || '',
        category.description_ar || '',
        category.description_en || '',
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

  return getCatalogCounts();
}

export function seedCatalogIfEmpty() {
  const before = getCatalogCounts();

  if (before.categories > 0 && before.products > 0) {
    return {
      seeded: false,
      before,
      after: before,
      reason: 'categories and products already have data',
    };
  }

  const after = upsertCatalogData();

  return {
    seeded: true,
    before,
    after,
    reason: 'catalog was empty or partially empty',
  };
}
