import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getDisplayName, formatPrice } from '../utils/helpers';
import Breadcrumb from '../components/Breadcrumb';
import OrderSummary from '../components/OrderSummary';
import BackLink from '../components/BackLink';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t, locale } = useLanguage();

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
      <BackLink to="/cart" label={t('cart.title')} className="mt-4" />

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
          <OrderSummary subtotal={subtotal}>
            {/* Item list */}
            <div className="mt-5 max-h-60 space-y-3 overflow-y-auto border-b border-stone-100 pb-4 mb-[-20px]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <img
                      src={item.image}
                      alt={getDisplayName(item, locale)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 truncate text-stone-700">
                    {getDisplayName(item, locale)} × {item.qty}
                  </div>
                  <span className="font-bold text-stone-800">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-action-dark"
            >
              <CheckCircle2 size={18} />
              {t('checkout.placeOrder')}
            </button>
          </OrderSummary>
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
