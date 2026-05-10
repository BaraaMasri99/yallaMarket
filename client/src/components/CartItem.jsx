import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatPrice,
  getDisplayName,
  getProductImageFallback,
  getProductEmoji,
} from '../utils/helpers';
import QuantitySelector from './QuantitySelector';

/**
 * Single cart item row used in CartPage.
 */
export default function CartItem({ item }) {
  const { removeItem, updateQty } = useCart();
  const { t, locale } = useLanguage();

  const displayName = getDisplayName(item, locale);
  const emoji = getProductEmoji(item);

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:shadow-card">
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {item.image ? (
          <img
            src={item.image}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getProductImageFallback(item);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 text-3xl">
            <span aria-hidden="true">{emoji}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-sm font-bold text-stone-800 leading-6">{displayName}</h3>
        <p className="text-xs text-stone-400">{item.unit}</p>

        <div className="flex items-center gap-4 mt-1">
          <QuantitySelector
            qty={item.qty}
            onChange={(n) => updateQty(item.id, n)}
          />

          <span className="text-sm font-black text-stone-900 ms-auto">
            {formatPrice(item.price * item.qty)} {t('product.currency')}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-red-50 hover:text-red-500"
        aria-label={t('cart.remove')}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
