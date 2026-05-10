import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
  res.json(rows);
});

// GET /api/categories/slug/:slug
router.get('/slug/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ message: 'Category not found' });
  res.json(row);
});

// GET /api/categories/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Category not found' });
  res.json(row);
});

// POST /api/categories  (admin)
router.post('/', requireAdmin, (req, res) => {
  const {
    name,
    name_ar = name,
    name_en = '',
    description_ar = '',
    description_en = '',
    slug,
    image = '',
    emoji = '',
    gradient = '',
  } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'name and slug are required' });
  }

  const result = db
    .prepare(
      `INSERT INTO categories
        (name, name_ar, name_en, description_ar, description_en, slug, image, emoji, gradient)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, name_ar, name_en, description_ar, description_en, slug, image, emoji, gradient);

  const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/categories/:id  (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const { name, name_ar, name_en, description_ar, description_en, slug, image, emoji, gradient } = req.body;

  db.prepare(
    `UPDATE categories SET
      name     = COALESCE(?, name),
      name_ar  = COALESCE(?, name_ar),
      name_en  = COALESCE(?, name_en),
      description_ar = COALESCE(?, description_ar),
      description_en = COALESCE(?, description_en),
      slug     = COALESCE(?, slug),
      image    = COALESCE(?, image),
      emoji    = COALESCE(?, emoji),
      gradient = COALESCE(?, gradient),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(
    name ?? null,
    name_ar ?? name ?? null,
    name_en ?? null,
    description_ar ?? null,
    description_en ?? null,
    slug ?? null,
    image ?? null,
    emoji ?? null,
    gradient ?? null,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

// DELETE /api/categories/:id  (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const productsCount = db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?')
    .get(req.params.id).count;
  if (productsCount > 0) {
    return res.status(409).json({ message: 'Cannot delete a category that still contains products' });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

export default router;
