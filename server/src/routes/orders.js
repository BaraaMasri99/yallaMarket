import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// POST /api/orders  — place an order
// Body: { user_id, shipping_address, payment_method?, notes?, items: [{ product_id, quantity }] }
router.post('/', (req, res) => {
  const { user_id, shipping_address, payment_method = 'cash', notes = '', items } = req.body;

  if (!user_id || !shipping_address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'user_id, shipping_address, and items are required' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
  if (!user) return res.status(400).json({ message: 'user_id does not exist' });

  // Validate all products and compute total
  let total_price = 0;
  const resolvedItems = [];

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ message: 'Each item needs product_id and quantity >= 1' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (!product) {
      return res.status(400).json({ message: `Product ${item.product_id} not found or inactive` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
    }

    total_price += product.price * item.quantity;
    resolvedItems.push({ product, quantity: item.quantity });
  }

  // Insert order + items in a transaction
  let orderId;

  try {
    db.exec('BEGIN');

    const orderResult = db
      .prepare(
        'INSERT INTO orders (user_id, shipping_address, payment_method, notes, total_price) VALUES (?, ?, ?, ?, ?)'
      )
      .run(user_id, shipping_address, payment_method, notes, total_price);

    orderId = orderResult.lastInsertRowid;

    for (const { product, quantity } of resolvedItems) {
      db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
      ).run(orderId, product.id, quantity, product.price);

      db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(quantity, product.id);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  res.status(201).json(getOrderWithItems(orderId));
});

// GET /api/orders/my?user_id=  — get orders for a specific user
// TODO: replace user_id query param with JWT once auth is built
router.get('/my', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: 'user_id query param required' });

  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(user_id);

  res.json(orders.map((o) => getOrderWithItems(o.id)));
});

// GET /api/orders  — get all orders (admin)
router.get('/', requireAdmin, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM orders';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const orders = db.prepare(query).all(...params);
  res.json(orders.map((o) => getOrderWithItems(o.id)));
});

// GET /api/orders/:id  — get single order
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(getOrderWithItems(order.id));
});

// PUT /api/orders/:id/status  — update order status (admin)
router.put('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, req.params.id);

  res.json(getOrderWithItems(req.params.id));
});

function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db
    .prepare(
      `SELECT oi.*, p.name, p.name_en, p.image
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(orderId);
  return { ...order, items };
}

export default router;
