import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdminRole } from '../middleware/adminAuth.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdminRole);

router.get('/categories', (req, res) => {
  const { search = '', sort = 'newest' } = req.query;
  const params = [];
  let query = `
    SELECT
      c.*,
      COUNT(p.id) AS products_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
  `;

  if (search.trim()) {
    query += `
      WHERE c.name LIKE ?
         OR c.name_ar LIKE ?
         OR c.name_en LIKE ?
         OR c.slug LIKE ?
    `;
    const like = `%${search.trim()}%`;
    params.push(like, like, like, like);
  }

  query += ' GROUP BY c.id ';

  if (sort === 'products') {
    query += ' ORDER BY products_count DESC, c.id DESC';
  } else if (sort === 'name') {
    query += ' ORDER BY c.name_ar COLLATE NOCASE ASC, c.name_en COLLATE NOCASE ASC';
  } else {
    query += ' ORDER BY c.created_at DESC, c.id DESC';
  }

  const categories = db.prepare(query).all(...params).map(toAdminCategory);
  res.json({ data: categories });
});

router.post('/categories', (req, res) => {
  const validation = validateCategory(req.body);
  if (validation.error) return res.status(400).json({ message: validation.error });

  const category = validation.value;
  const slugExists = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category.slug);
  if (slugExists) return res.status(409).json({ message: 'Category slug already exists' });

  const result = db
    .prepare(
      `INSERT INTO categories
        (name, name_ar, name_en, description_ar, description_en, slug, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category.name_ar,
      category.name_ar,
      category.name_en,
      category.description_ar,
      category.description_en,
      category.slug,
      category.image
    );

  res.status(201).json({
    message: 'Category created',
    data: getAdminCategory(result.lastInsertRowid),
  });
});

router.put('/categories/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const validation = validateCategory(req.body);
  if (validation.error) return res.status(400).json({ message: validation.error });

  const category = validation.value;
  const slugExists = db
    .prepare('SELECT id FROM categories WHERE slug = ? AND id != ?')
    .get(category.slug, req.params.id);
  if (slugExists) return res.status(409).json({ message: 'Category slug already exists' });

  db.prepare(
    `UPDATE categories SET
      name = ?,
      name_ar = ?,
      name_en = ?,
      description_ar = ?,
      description_en = ?,
      slug = ?,
      image = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(
    category.name_ar,
    category.name_ar,
    category.name_en,
    category.description_ar,
    category.description_en,
    category.slug,
    category.image,
    req.params.id
  );

  res.json({
    message: 'Category updated',
    data: getAdminCategory(req.params.id),
  });
});

router.delete('/categories/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const productsCount = db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ? AND is_active = 1')
    .get(req.params.id).count;

  if (productsCount > 0) {
    return res.status(409).json({
      message: 'Cannot delete a category that still contains products',
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

router.get('/dashboard/stats', (req, res) => {
  return sendDashboardStats(res);
});

router.get('/stats', (req, res) => {
  return sendDashboardStats(res);
});

function sendDashboardStats(res) {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE is_active = 1) AS total_products,
      (SELECT COUNT(*) FROM categories) AS total_categories,
      (SELECT COUNT(*) FROM orders) AS total_orders,
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status != 'cancelled') AS total_sales,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
      (SELECT COUNT(*) FROM products WHERE is_active = 1 AND stock <= 0) AS out_of_stock_products
  `).get();

  res.json({
    data: {
      totalProducts: Number(stats.total_products || 0),
      totalCategories: Number(stats.total_categories || 0),
      totalOrders: Number(stats.total_orders || 0),
      totalUsers: Number(stats.total_users || 0),
      totalSales: Number(stats.total_sales || 0),
      pendingOrders: Number(stats.pending_orders || 0),
      outOfStockProducts: Number(stats.out_of_stock_products || 0),
    },
  });
}

function getAdminCategory(id) {
  return toAdminCategory(db.prepare(`
    SELECT
      c.*,
      COUNT(p.id) AS products_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id));
}

function toAdminCategory(row) {
  return {
    ...row,
    name_ar: row.name_ar || row.name || '',
    products_count: Number(row.products_count || 0),
  };
}

function validateCategory(body) {
  const nameAr = cleanText(body.name_ar ?? body.name);
  const nameEn = cleanText(body.name_en);
  const descriptionAr = cleanText(body.description_ar);
  const descriptionEn = cleanText(body.description_en);
  const slug = slugify(cleanText(body.slug || nameEn || nameAr));
  const image = cleanText(body.image);

  if (!nameAr) return { error: 'Arabic name is required' };
  if (!nameEn) return { error: 'English name is required' };
  if (!slug) return { error: 'Slug is required' };
  if (slug.length > 120) return { error: 'Slug must be 120 characters or less' };

  return {
    value: {
      name_ar: nameAr,
      name_en: nameEn,
      description_ar: descriptionAr,
      description_en: descriptionEn,
      slug,
      image,
    },
  };
}

function cleanText(value) {
  return String(value || '').trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default router;
