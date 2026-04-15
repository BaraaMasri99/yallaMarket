import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';

const DELIVERY_THRESHOLD = 100;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : 10;
  const grandTotal = subtotal + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI only — no actual order processing
    setSubmitted(true);
    clearCart();
  };

  // Redirect to cart if empty and not submitted
  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Breadcrumb items={[{ label: t('checkout.title') }]} />
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-stone-500">{t('cart.empty')}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-110"
          >
            {t('cart.browseCta')}
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-action/10 text-action">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="text-2xl font-black text-stone-900">
            {t('checkout.orderSuccess')}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-7 text-stone-500">
            {t('checkout.orderSuccessText')}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-card transition hover:bg-primary"
          >
            {t('checkout.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Breadcrumb
        items={[
          { label: t('cart.title'), to: '/cart' },
          { label: t('checkout.title') },
        ]}
      />

      {/* Back */}
      <Link
        to="/cart"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:brightness-110"
      >
        <BackArrow size={16} />
        {t('cart.title')}
      </Link>

      <h1 className="mt-4 text-3xl font-black text-stone-900">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* ── Form fields ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal info */}
          <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-stone-900">
              {t('checkout.personalInfo')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={t('checkout.firstName')} name="firstName" required />
              <InputField label={t('checkout.lastName')} name="lastName" required />
              <InputField label={t('checkout.phone')} name="phone" type="tel" required />
              <InputField label={t('checkout.email')} name="email" type="email" />
            </div>
          </section>

          {/* Delivery address */}
          <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-stone-900">
              {t('checkout.deliveryAddress')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={t('checkout.city')} name="city" required />
              <InputField label={t('checkout.street')} name="street" required />
              <InputField label={t('checkout.building')} name="building" />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  {t('checkout.notes')}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder={t('checkout.notesPlaceholder')}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-primary transition resize-none"
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-stone-900">
              {t('checkout.paymentMethod')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                icon={Banknote}
                label={t('checkout.cashOnDelivery')}
                selected={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
              />
              <PaymentOption
                icon={CreditCard}
                label={t('checkout.creditCard')}
                selected={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              />
            </div>
          </section>
        </div>

        {/* ── Order summary sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-stone-900 mb-5">
              {t('checkout.orderSummary')}
            </h2>

            {/* Item list */}
            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const name = locale === 'en' && item.nameEn ? item.nameEn : item.name;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <img src={item.image} alt={name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 truncate text-stone-700">{name} × {item.qty}</div>
                    <span className="font-bold text-stone-800">
                      {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm">
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

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-action-dark"
            >
              <CheckCircle2 size={18} />
              {t('checkout.placeOrder')}
            </button>
          </div>
        </div>
      </form>

      <div className="h-12" />
    </div>
  );
}

/* ── Reusable sub-components ── */

function InputField({ label, name, type = 'text', required = false }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-stone-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-primary transition"
      />
    </div>
  );
}

function PaymentOption({ icon: Icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-sm font-semibold transition ${
        selected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
}
