// Service layer for products
// Currently reads from mock data; will be replaced by API calls later
import { products } from '../../data/products';

/**
 * Get all products.
 * @returns {Promise<Array>}
 */
export async function getAllProducts() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...products]), 100);
  });
}

/**
 * Get products belonging to a category.
 * @param {number} categoryId
 * @returns {Promise<Array>}
 */
export async function getProductsByCategory(categoryId) {
  return new Promise((resolve) => {
    const filtered = products.filter((p) => p.categoryId === categoryId);
    setTimeout(() => resolve(filtered), 80);
  });
}

/**
 * Get a single product by its ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
  return new Promise((resolve) => {
    const product = products.find((p) => p.id === id) || null;
    setTimeout(() => resolve(product), 50);
  });
}

/**
 * Search products by name (Arabic or English).
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchProducts(query) {
  return new Promise((resolve) => {
    const q = query.toLowerCase().trim();
    if (!q) return resolve([]);
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
    );
    setTimeout(() => resolve(results), 80);
  });
}

/**
 * Get related products (same category, excluding current product).
 * @param {number} productId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRelatedProducts(productId, limit = 4) {
  return new Promise((resolve) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return resolve([]);
    const related = products
      .filter((p) => p.categoryId === product.categoryId && p.id !== productId)
      .slice(0, limit);
    setTimeout(() => resolve(related), 80);
  });
}
