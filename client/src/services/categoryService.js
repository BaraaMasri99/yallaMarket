// Service layer for categories
// Currently reads from mock data; will be replaced by API calls later
import { categories } from '../../data/categories';

/**
 * Get all categories.
 * @returns {Promise<Array>}
 */
export async function getAllCategories() {
  // Simulate network delay (remove when connecting to backend)
  return new Promise((resolve) => {
    setTimeout(() => resolve([...categories]), 100);
  });
}

/**
 * Get a single category by its slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getCategoryBySlug(slug) {
  return new Promise((resolve) => {
    const cat = categories.find((c) => c.slug === slug) || null;
    setTimeout(() => resolve(cat), 50);
  });
}

/**
 * Get a single category by its ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getCategoryById(id) {
  return new Promise((resolve) => {
    const cat = categories.find((c) => c.id === id) || null;
    setTimeout(() => resolve(cat), 50);
  });
}
