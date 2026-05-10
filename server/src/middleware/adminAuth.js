import { requireAuth } from './authMiddleware.js';

export function requireAdminRole(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}

export function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => requireAdminRole(req, res, next));
}
