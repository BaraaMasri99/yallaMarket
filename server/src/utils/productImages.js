const CATEGORY_FALLBACK_QUERIES = {
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

const PRODUCT_QUERY_RULES = [
  { keys: ['playstation', 'بلايستيشن'], query: 'playstation,gift,card' },
  { keys: ['xbox', 'اكس بوكس'], query: 'xbox,gift,card' },
  { keys: ['pubg', 'شدات'], query: 'pubg,mobile,game' },
  { keys: ['netflix', 'نتفلكس'], query: 'netflix,streaming,subscription' },
  { keys: ['spotify', 'سبوتيفاي'], query: 'spotify,music,subscription' },
  { keys: ['mobile balance', 'رصيد جوال', 'top-up', 'recharge'], query: 'mobile,phone,recharge' },
  { keys: ['amazon gift', 'بطاقة amazon'], query: 'amazon,gift,card' },
  { keys: ['apple gift', 'بطاقة apple'], query: 'apple,gift,card' },
  { keys: ['microsoft 365'], query: 'microsoft,office,laptop' },
  { keys: ['vpn'], query: 'vpn,cyber,security' },
  { keys: ['steam wallet', 'بطاقة steam'], query: 'steam,gift,card' },
  { keys: ['google play', 'بطاقة google play'], query: 'google,play,gift,card' },
  { keys: ['shahid'], query: 'streaming,tv,subscription' },
  { keys: ['tod subscription', 'بطاقة tod'], query: 'sports,streaming,subscription' },
  { keys: ['canva'], query: 'design,workspace,laptop' },
  { keys: ['udemy'], query: 'online,course,learning' },
  { keys: ['tomatoes', 'طماطم'], query: 'fresh,tomatoes' },
  { keys: ['apples', 'تفاح'], query: 'red,apples' },
  { keys: ['bananas', 'موز'], query: 'bananas,fruit' },
  { keys: ['potatoes', 'بطاطا'], query: 'potatoes,vegetable' },
  { keys: ['oranges', 'برتقال'], query: 'oranges,fruit' },
  { keys: ['oats', 'شوفان'], query: 'oats,healthy,breakfast' },
  { keys: ['granola', 'جرانولا'], query: 'granola,breakfast,bowl' },
  { keys: ['honey', 'عسل'], query: 'honey,jar,organic' },
  { keys: ['quinoa', 'كينوا'], query: 'quinoa,healthy,grain' },
  { keys: ['arabic bread', 'خبز عربي'], query: 'arabic,bread,bakery' },
  { keys: ['croissant', 'كرواسون'], query: 'croissant,bakery' },
  { keys: ['samoun', 'صمون'], query: 'bread,roll,bakery' },
  { keys: ['ground meat', 'لحم مفروم'], query: 'ground,beef,meat' },
  { keys: ['lamb chops', 'اوصال خروف'], query: 'lamb,chops,meat' },
  { keys: ['labneh', 'لبنة'], query: 'labneh,cream,cheese' },
  { keys: ['eggs', 'بيض'], query: 'free,range,eggs' },
  { keys: ['ice cream', 'ايس كريم'], query: 'vanilla,ice,cream' },
  { keys: ['sugar', 'سكر'], query: 'sugar,cubes,bowl' },
  { keys: ['pasta', 'معكرونة'], query: 'pasta,italian,food' },
  { keys: ['tahini', 'طحينة'], query: 'tahini,sesame,sauce' },
  { keys: ['green tea', 'شاي اخضر'], query: 'green,tea,leaves' },
  { keys: ['turkish coffee', 'قهوة تركية'], query: 'turkish,coffee,cup' },
  { keys: ['garbage bags', 'اكياس قمامة'], query: 'garbage,bags,household' },
  { keys: ['shampoo', 'شامبو'], query: 'shampoo,bottle,haircare' },
  { keys: ['soap', 'صابون'], query: 'soap,bar,skincare' },
  { keys: ['toothpaste', 'معجون اسنان'], query: 'toothpaste,toothbrush,dental' },
  { keys: ['dark chocolate', 'شوكولاتة'], query: 'dark,chocolate,bar' },
  { keys: ['turkish delight', 'حلقوم'], query: 'turkish,delight,sweets' },
  { keys: ['biscuits', 'بسكويت'], query: 'chocolate,biscuits,snack' },
  { keys: ['pistachios', 'فستق'], query: 'pistachios,nuts,roasted' },
  { keys: ['cashews', 'كاجو'], query: 'cashews,roasted,nuts' },
  { keys: ['almonds', 'لوز'], query: 'almonds,roasted,nuts' },
  { keys: ['chips', 'شيبس'], query: 'potato,chips,snack' },
  { keys: ['popcorn', 'بوشار'], query: 'butter,popcorn,snack' },
  { keys: ['crackers', 'بسكويت مالح'], query: 'salty,crackers,snack' },
];

export function resolveProductImage(product) {
  const current = String(product?.image || '').trim();
  if (current && !imageNeedsReplacement(current)) {
    return current;
  }

  const query = findProductQuery(product) || getCategoryFallbackQuery(product?.category_id ?? product?.categoryId);
  return buildImageUrl(query, Number(product?.id || 1));
}

export function imageNeedsReplacement(image) {
  const value = String(image || '').trim().toLowerCase();
  return (
    !value
    || value.includes('placeholder')
    || value.includes('source.unsplash.com')
  );
}

export function buildImageUrl(query, seed = 1) {
  const encodedQuery = encodeURIComponent(query || 'shopping,product,store');
  return `https://loremflickr.com/800/600/${encodedQuery}?lock=${Number(seed) || 1}`;
}

export function getCategoryFallbackQuery(categoryId) {
  return CATEGORY_FALLBACK_QUERIES[Number(categoryId)] || 'shopping,product,store';
}

function findProductQuery(product) {
  const text = normalizeText([product?.name_en, product?.name].filter(Boolean).join(' '));

  for (const rule of PRODUCT_QUERY_RULES) {
    if (rule.keys.some((key) => text.includes(normalizeText(key)))) {
      return rule.query;
    }
  }

  return '';
}

function normalizeText(value) {
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
