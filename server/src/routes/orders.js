import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const DELIVERY_THRESHOLD = 100;
const DELIVERY_FEE = 10;

// POST /api/orders - place an order for the authenticated user.
// Body: { shipping_address, payment_method?, notes?, items: [{ product_id, quantity }] }
router.post('/', requireAuth, (req, res) => {
  const {
    first_name,
    firstName,
    last_name,
    lastName,
    phone,
    email = '',
    city,
    address,
    shipping_address,
    payment_method,
    paymentMethod,
    notes = '',
    items,
  } = req.body;
  const userId = req.user.id;
  const customerFirstName = cleanText(first_name || firstName);
  const customerLastName = cleanText(last_name || lastName);
  const customerPhone = cleanText(phone);
  const customerEmail = cleanText(email).toLowerCase();
  const customerCity = cleanText(city);
  const customerAddress = cleanText(address || shipping_address);
  const paymentMethodValue = cleanText(payment_method || paymentMethod || 'cash');
  const orderNotes = cleanText(notes);
  const shippingAddress = [customerCity, customerAddress].filter(Boolean).join(', ');

  if (
    !customerFirstName ||
    !customerLastName ||
    !customerPhone ||
    !customerCity ||
    !customerAddress ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: 'first_name, last_name, phone, city, address, and items are required',
    });
  }

  // Validate all products and compute totals server-side.
  let subtotal = 0;
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

    subtotal += product.price * item.quantity;
    resolvedItems.push({ product, quantity: item.quantity });
  }

  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  // Insert order + items in a transaction
  let orderId;

  try {
    db.exec('BEGIN');

    const orderResult = db
      .prepare(
        `INSERT INTO orders (
          user_id,
          customer_first_name,
          customer_last_name,
          customer_phone,
          customer_email,
          city,
          address,
          shipping_address,
          payment_method,
          notes,
          subtotal,
          delivery_fee,
          total,
          total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        userId,
        customerFirstName,
        customerLastName,
        customerPhone,
        customerEmail,
        customerCity,
        customerAddress,
        shippingAddress,
        paymentMethodValue,
        orderNotes,
        subtotal,
        deliveryFee,
        total,
        total
      );

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

// GET /api/orders/my - get orders for the authenticated user.
router.get('/my', requireAuth, (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);

  res.json(orders.map((o) => getOrderWithItems(o.id)));
});

// GET /api/orders - get all orders (admin)
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

// GET /api/orders/:id - admins can read any order; customers can only read their own.
router.get('/:id', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only access your own orders' });
  }

  res.json(getOrderWithItems(order.id));
});

// PUT /api/orders/:id/status - update order status (admin)
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

function cleanText(value) {
  return String(value || '').trim();
}

export default router;
