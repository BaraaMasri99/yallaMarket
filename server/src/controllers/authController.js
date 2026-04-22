import { createUser, findUserByEmail, normalizeEmail } from '../models/userModel.js';
import { signAuthToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

export async function register(req, res, next) {
  try {
    const { full_name, fullName, email, phone, password } = req.body;
    const resolvedFullName = String(full_name || fullName || '').trim();
    const resolvedEmail = normalizeEmail(email);
    const resolvedPhone = String(phone || '').trim();

    const validationError = validateRegisterInput({
      fullName: resolvedFullName,
      email: resolvedEmail,
      phone: resolvedPhone,
      password,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = findUserByEmail(resolvedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({
      fullName: resolvedFullName,
      email: resolvedEmail,
      phone: resolvedPhone,
      passwordHash,
    });
    const token = signAuthToken(user);

    return res.status(201).json({ message: 'Registered successfully', token, user });
  } catch (error) {
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resolvedEmail = normalizeEmail(email);

    if (!resolvedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!emailRegex.test(resolvedEmail)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = findUserByEmail(resolvedEmail);
    const passwordMatches = user
      ? await comparePassword(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signAuthToken(user);
    return res.json({
      message: 'Logged in successfully',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  return res.json({ message: 'Logged out successfully' });
}

function validateRegisterInput({ fullName, email, phone, password }) {
  if (!fullName || !email || !phone || !password) {
    return 'full_name, email, phone, and password are required';
  }

  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }

  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number';
  }

  if (String(password).length < 6) {
    return 'Password must be at least 6 characters';
  }

  return '';
}

function toPublicUser(user) {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}
