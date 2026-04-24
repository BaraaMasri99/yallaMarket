import { api, authConfig } from './api';

export function registerUser({ fullName, email, phone, password }) {
  return api.post('/api/auth/register', {
    full_name: fullName,
    email,
    phone,
    password,
  });
}

export function loginUser({ email, password }) {
  return api.post('/api/auth/login', { email, password });
}

export function logoutUser(token) {
  return api.post('/api/auth/logout', null, authConfig(token));
}
