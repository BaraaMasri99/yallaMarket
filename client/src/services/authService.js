const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function requestAuth(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data?.message || 'Authentication request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function registerUser({ fullName, email, phone, password }) {
  return requestAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      phone,
      password,
    }),
  });
}

export function loginUser({ email, password }) {
  return requestAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser(token) {
  return requestAuth('/api/auth/logout', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
