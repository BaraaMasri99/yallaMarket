import { useLanguage } from '../context/LanguageContext';
import { formatPrice, calcDeliveryFee } from '../utils/helpers';

/**
 * Reusable order summary widget used in CartPage and CheckoutPage.
 * @param {{ subtotal: number, children?: React.ReactNode }} props
 *   – children: optional CTA button at the bottom
 */
export default function OrderSummary({ subtotal, children }) {
  const { t } = useLanguage();

  const deliveryFee = calcDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="sticky top-24 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-card">
      <h2 className="text-lg font-bold text-stone-900 mb-5">
        {t('checkout.orderSummary')}
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>{t('cart.subtotal')}</span>
          <span className="font-bold text-stone-800">
            {formatPrice(subtotal)} {t('product.currency')}
          </span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span>{t('cart.delivery')}</span>
          <span className="font-bold text-stone-800">
            {deliveryFee === 0
              ? t('cart.deliveryFree')
              : `${formatPrice(deliveryFee)} ${t('product.currency')}`}
          </span>
        </div>

        <div className="border-t border-stone-100 pt-3 flex justify-between">
          <span className="font-bold text-stone-900">{t('cart.grandTotal')}</span>
          <span className="text-lg font-black text-primary">
            {formatPrice(grandTotal)} {t('product.currency')}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
