import { findUserById } from '../models/userModel.js';
import { verifyAuthToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) return '';
  return token;
}
