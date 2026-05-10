import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatPrice,
  getDisplayName,
  getProductImageFallback,
  getProductEmoji,
} from '../utils/helpers';

/**
 * Product card used in category pages and related products.
 */
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const [added, setAdded] = useState(false);

  const displayName = getDisplayName(product, locale);
  const emoji = getProductEmoji(product);

  const handleAdd = (e) => {
    e.preventDefault(); // don't navigate
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-card hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.image ? (
          <img
            src={product.image}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getProductImageFallback(product);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 text-5xl transition-transform duration-500 group-hover:scale-110">
            <span aria-hidden="true">{emoji}</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 start-2.5 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-800">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-sm font-bold leading-6 text-stone-800 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {displayName}
        </h3>

        <p className="text-xs text-stone-400">{product.unit}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-black text-stone-900">
            {formatPrice(product.price)}{' '}
            <span className="text-xs font-medium text-stone-500">{t('product.currency')}</span>
          </span>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock || added}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition-all duration-300 ${
              added
                ? 'bg-action scale-110'
                : product.inStock
                ? 'bg-stone-900 hover:bg-primary hover:scale-110'
                : 'bg-stone-300 cursor-not-allowed'
            }`}
            aria-label={t('product.addToCart')}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}
