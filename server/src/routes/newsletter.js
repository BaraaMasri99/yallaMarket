import { Router } from 'express';
import { db } from '../config/database.js';

const router = Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/subscribe', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);
    return res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ message: 'Email is already subscribed' });
    }

    throw error;
  }
});

export default router;
