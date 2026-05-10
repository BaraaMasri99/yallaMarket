import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { resolveProductImage } from '../utils/productImages.js';

const router = Router();

// GET /api/products
// Supports: ?category_id=, ?search=, ?page=, ?limit=
router.get('/', (req, res) => {
  const { category_id, search, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (category_id) {
    query += ' AND category_id = ?';
    params.push(Number(category_id));
  }

  if (search) {
    query += ' AND (name LIKE ? OR name_en LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const rows = db.prepare(query).all(...params);
  res.json(rows.map(toProduct));
});

// GET /api/products/related/:id
router.get('/related/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const rows = db
    .prepare(
      'SELECT * FROM products WHERE category_id = ? AND id != ? AND is_active = 1 LIMIT 4'
    )
    .all(product.category_id, product.id);

  res.json(rows.map(toProduct));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Product not found' });
  res.json(toProduct(row));
});

// POST /api/products  (admin)
router.post('/', requireAdmin, (req, res) => {
  const {
    name,
    name_en = '',
    description = '',
    description_en = '',
    price,
    unit = '',
    stock = 0,
    image = '',
    badge = '',
    category_id,
  } = req.body;

  if (!name || price === undefined || !category_id) {
    return res.status(400).json({ message: 'name, price, and category_id are required' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) return res.status(400).json({ message: 'category_id does not exist' });

  const result = db
    .prepare(
      `INSERT INTO products
        (name, name_en, description, description_en, price, unit, stock, image, badge, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, name_en, description, description_en, price, unit, stock, image, badge, category_id);

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(toProduct(created));
});

// PUT /api/products/:id  (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  const { name, name_en, description, description_en, price, unit, stock, image, badge, category_id, is_active } = req.body;

  db.prepare(
    `UPDATE products SET
      name           = COALESCE(?, name),
      name_en        = COALESCE(?, name_en),
      description    = COALESCE(?, description),
      description_en = COALESCE(?, description_en),
      price          = COALESCE(?, price),
      unit           = COALESCE(?, unit),
      stock          = COALESCE(?, stock),
      image          = COALESCE(?, image),
      badge          = COALESCE(?, badge),
      category_id    = COALESCE(?, category_id),
      is_active      = COALESCE(?, is_active),
      updated_at     = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(
    name ?? null, name_en ?? null, description ?? null, description_en ?? null,
    price ?? null, unit ?? null, stock ?? null, image ?? null, badge ?? null,
    category_id ?? null, is_active ?? null,
    req.params.id
  );

  res.json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)));
});

// DELETE /api/products/:id  (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Normalize DB row to match frontend shape
function toProduct(row) {
  return {
    ...row,
    image: resolveProductImage(row),
    inStock: row.stock > 0,
    is_active: Boolean(row.is_active),
  };
}

export default router;
