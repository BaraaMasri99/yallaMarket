import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import CartItem from '../components/CartItem';

const DELIVERY_THRESHOLD = 100; // free delivery above this amount

export default function CartPage() {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const { t, locale } = useLanguage();

  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : 10;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Breadcrumb items={[{ label: t('cart.title') }]} />

      <h1 className="mt-6 text-3xl font-black text-stone-900">
        {t('cart.title')}
      </h1>

      {items.length === 0 ? (
        /* ── Empty state ── */
        <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-700">{t('cart.empty')}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">
            {t('cart.emptyText')}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-110"
          >
            {t('cart.browseCta')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm text-stone-500">
              {totalItems} {t('cart.itemCount')}
            </p>

            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:brightness-110"
              >
                <BackArrow size={16} />
                {t('cart.continueShopping')}
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-semibold text-red-500 transition hover:text-red-600"
              >
                {t('cart.remove')} الكل
              </button>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-card">
              <h2 className="text-lg font-bold text-stone-900 mb-5">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-bold text-stone-800">
                    {subtotal.toFixed(2)} {t('product.currency')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.delivery')}</span>
                  <span className="font-bold text-stone-800">
                    {deliveryFee === 0
                      ? t('cart.deliveryFree')
                      : `${deliveryFee.toFixed(2)} ${t('product.currency')}`}
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between">
                  <span className="font-bold text-stone-900">{t('cart.grandTotal')}</span>
                  <span className="text-lg font-black text-primary">
                    {grandTotal.toFixed(2)} {t('product.currency')}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-primary"
              >
                {t('cart.checkout')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
}
