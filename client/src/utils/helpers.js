// Shared utility helpers
// Keep small helpers here to avoid duplicating logic across components.

/**
 * Return the display name for a product based on locale.
 * Falls back to Arabic name if English name is missing.
 * @param {{ name: string, nameEn?: string }} item
 * @param {string} locale – 'ar' | 'en'
 * @returns {string}
 */
export function getDisplayName(item, locale) {
  return locale === 'en' && item.nameEn ? item.nameEn : item.name;
}

/**
 * Return the display description for a product based on locale.
 * @param {{ description: string, descriptionEn?: string }} item
 * @param {string} locale – 'ar' | 'en'
 * @returns {string}
 */
export function getDisplayDescription(item, locale) {
  return locale === 'en' && item.descriptionEn
    ? item.descriptionEn
    : item.description;
}

/**
 * Format a number as a price string with 2 decimal places.
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return amount.toFixed(2);
}

/** Free delivery threshold in ILS */
export const DELIVERY_THRESHOLD = 100;

/** Delivery fee in ILS */
export const DELIVERY_FEE = 10;

/**
 * Calculate delivery fee based on subtotal.
 * @param {number} subtotal
 * @returns {number}
 */
export function calcDeliveryFee(subtotal) {
  return subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
