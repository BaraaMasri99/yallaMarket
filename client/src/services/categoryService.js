import { api } from './api';

function normalizeCategory(category) {
  if (!category) return null;
  return {
    ...category,
    nameAr: category.nameAr ?? category.name_ar ?? category.name ?? '',
    nameEn: category.nameEn ?? category.name_en ?? '',
    descriptionAr: category.descriptionAr ?? category.description_ar ?? '',
    descriptionEn: category.descriptionEn ?? category.description_en ?? '',
    image: category.image || '',
    emoji: category.emoji || '🛍️',
    gradient: category.gradient || 'from-stone-300 to-stone-100',
  };
}

function normalizeCategories(categories) {
  return Array.isArray(categories) ? categories.map(normalizeCategory) : [];
}

/**
 * Get all categories.
 * @returns {Promise<Array>}
 */
export async function getAllCategories() {
  const categories = await api.get('/api/categories');
  return normalizeCategories(categories);
}

/**
 * Get a single category by its slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getCategoryBySlug(slug) {
  try {
    const category = await api.get(`/api/categories/slug/${slug}`);
    return normalizeCategory(category);
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
    const category = await api.get(`/api/categories/${id}`);
    return normalizeCategory(category);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
