import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const apiError = new Error(data?.message || error.message || 'API request failed');
    apiError.status = error.response?.status;
    apiError.data = data;
    throw apiError;
  }
);

export function authConfig(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
