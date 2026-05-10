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

export function getDisplayCategoryName(category, locale) {
  if (!category) return '';
  if (locale === 'en') {
    return category.nameEn || category.name_en || category.name || '';
  }
  return category.nameAr || category.name_ar || category.name || '';
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

export function getProductEmoji(product) {
  const text = normalizeSearchText(
    [
      product?.name,
      product?.nameEn,
      product?.name_en,
      product?.description,
      product?.descriptionEn,
      product?.description_en,
      product?.categoryName,
      product?.category_name,
    ].filter(Boolean).join(' ')
  );

  if (text.includes('playstation') || text.includes('بلايستيشن')) return '🎮';
  if (text.includes('xbox') || text.includes('اكس بوكس')) return '🕹️';
  if (text.includes('steam')) return '💻';
  if (text.includes('netflix') || text.includes('نتفلكس')) return '🎬';
  if (text.includes('spotify') || text.includes('سبوتيفاي')) return '🎧';
  if (text.includes('pubg') || text.includes('شدات')) return '🎮';
  if (text.includes('mobile') || text.includes('جوال') || text.includes('رصيد')) return '📱';
  if (text.includes('gift') || text.includes('هديه') || text.includes('قسيمه')) return '🎁';
  if (text.includes('card') || text.includes('بطاقه') || text.includes('كرت')) return '💳';
  if (text.includes('subscription') || text.includes('اشتراك')) return '📦';
  if (text.includes('software') || text.includes('key') || text.includes('مفتاح')) return '🔐';

  return '🛒';
}

export function getProductImageFallback(product) {
  const categoryId = Number(product?.categoryId ?? product?.category_id);

  const fallbackQueries = {
    1: 'fresh,vegetables,fruits,market',
    2: 'healthy,food,organic,diet',
    3: 'bakery,bread,pastry',
    4: 'gaming,gift,card',
    5: 'digital,subscription,streaming',
    6: 'mobile,phone,recharge',
    7: 'gift,card,shopping',
    8: 'software,license,keyboard',
    9: 'online,store,gift,card',
    10: 'entertainment,subscription,streaming',
    11: 'online,learning,productivity',
    12: 'personal,care,hygiene',
    13: 'sweets,chocolate,dessert',
    14: 'nuts,roasted,snacks',
    15: 'chips,snacks,popcorn',
  };

  const query = fallbackQueries[categoryId] || 'shopping,product,store';
  const seed = Number(product?.id || 1);
  return `https://loremflickr.com/800/600/${encodeURIComponent(query)}?lock=${seed}`;
}

export function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
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
