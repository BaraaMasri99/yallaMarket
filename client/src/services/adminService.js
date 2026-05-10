import { api, authConfig } from './api';

function unwrap(response) {
  return response?.data ?? response;
}

export async function getAdminCategories(token, params = {}) {
  return unwrap(await api.get('/api/admin/categories', {
    ...authConfig(token),
    params,
  }));
}

export async function createAdminCategory(category, token) {
  return unwrap(await api.post('/api/admin/categories', category, authConfig(token)));
}

export async function updateAdminCategory(id, category, token) {
  return unwrap(await api.put(`/api/admin/categories/${id}`, category, authConfig(token)));
}

export async function deleteAdminCategory(id, token) {
  return api.delete(`/api/admin/categories/${id}`, authConfig(token));
}

export async function getDashboardStats(token) {
  try {
    return unwrap(await api.get('/api/admin/dashboard/stats', authConfig(token)));
  } catch (error) {
    if (error?.status === 404) {
      return unwrap(await api.get('/api/admin/stats', authConfig(token)));
    }
    throw error;
  }
}
