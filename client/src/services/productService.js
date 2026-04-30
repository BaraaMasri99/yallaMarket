import { api, authConfig } from './api';

function normalizeProduct(product) {
  if (!product) return null;

  const stock = Number(product.stock || 0);
  const categoryId = product.category_id ?? product.categoryId;

  return {
    ...product,
    categoryId,
    nameEn: product.nameEn ?? product.name_en ?? '',
    descriptionEn: product.descriptionEn ?? product.description_en ?? '',
    price: Number(product.price || 0),
    stock,
    image: product.image || '',
    unit: product.unit || '',
    inStock: product.inStock ?? stock > 0,
  };
}

function normalizeProducts(products) {
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
}

/**
 * Get all products.
 * @returns {Promise<Array>}
 */
export async function getAllProducts() {
  const products = await api.get('/api/products', { params: { limit: 1000 } });
  return normalizeProducts(products);
}

/**
 * Get products belonging to a category.
 * @param {number} categoryId
 * @returns {Promise<Array>}
 */
export async function getProductsByCategory(categoryId) {
  const products = await api.get('/api/products', {
    params: { category_id: categoryId, limit: 1000 },
  });
  return normalizeProducts(products);
}

/**
 * Get a single product by its ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
  try {
    const product = await api.get(`/api/products/${id}`);
    return normalizeProduct(product);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Search products by name (Arabic or English).
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchProducts(query) {
  const q = query.trim();
  if (!q) return [];

  const products = await api.get('/api/products', {
    params: { search: q, limit: 1000 },
  });
  return normalizeProducts(products);
}

/**
 * Get related products (same category, excluding current product).
 * @param {number} productId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRelatedProducts(productId, limit = 4) {
  const products = await api.get(`/api/products/related/${productId}`);
  return normalizeProducts(products).slice(0, limit);
}

export async function createProduct(product, token) {
  const created = await api.post('/api/products', product, authConfig(token));
  return normalizeProduct(created);
}

export async function updateProduct(id, product, token) {
  const updated = await api.put(`/api/products/${id}`, product, authConfig(token));
  return normalizeProduct(updated);
}

export async function deleteProduct(id, token) {
  return api.delete(`/api/products/${id}`, authConfig(token));
}
