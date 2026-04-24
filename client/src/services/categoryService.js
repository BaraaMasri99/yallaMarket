import { api } from './api';

/**
 * Get all categories.
 * @returns {Promise<Array>}
 */
export async function getAllCategories() {
  return api.get('/api/categories');
}

/**
 * Get a single category by its slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getCategoryBySlug(slug) {
  try {
    return await api.get(`/api/categories/slug/${slug}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Get a single category by its ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getCategoryById(id) {
  try {
    return await api.get(`/api/categories/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
