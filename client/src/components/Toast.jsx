import { useEffect, useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getDisplayName } from '../utils/helpers';

/**
 * Global floating toast notification for add-to-cart feedback.
 * Auto-dismisses after 2 seconds.
 */
export default function Toast() {
  const { toast, dismissToast } = useCart();
  const { t, locale } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissToast, 300); // wait for exit animation
    }, 2000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const name = getDisplayName(toast, locale);

  return (
    <div
      className={`fixed bottom-6 start-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-5 py-3.5 shadow-2xl transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-action text-white">
        <ShoppingCart size={14} />
      </div>
      <p className="text-sm font-semibold text-stone-800">
        {name} — {t('product.added')}
      </p>
      <button
        type="button"
        onClick={() => { setVisible(false); setTimeout(dismissToast, 300); }}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 transition hover:text-stone-600"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
