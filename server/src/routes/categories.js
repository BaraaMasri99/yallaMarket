import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
  res.json(rows);
});

// GET /api/categories/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Category not found' });
  res.json(row);
});

// GET /api/categories/slug/:slug
router.get('/slug/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ message: 'Category not found' });
  res.json(row);
});

// POST /api/categories  (admin)
router.post('/', requireAdmin, (req, res) => {
  const { name, slug, image = '', emoji = '', gradient = '' } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'name and slug are required' });
  }

  const result = db
    .prepare(
      'INSERT INTO categories (name, slug, image, emoji, gradient) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, slug, image, emoji, gradient);

  const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/categories/:id  (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const { name, slug, image, emoji, gradient } = req.body;

  db.prepare(
    `UPDATE categories SET
      name     = COALESCE(?, name),
      slug     = COALESCE(?, slug),
      image    = COALESCE(?, image),
      emoji    = COALESCE(?, emoji),
      gradient = COALESCE(?, gradient),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(name ?? null, slug ?? null, image ?? null, emoji ?? null, gradient ?? null, req.params.id);

  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

// DELETE /api/categories/:id  (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

export default router;
