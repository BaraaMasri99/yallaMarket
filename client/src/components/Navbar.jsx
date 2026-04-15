import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useEffect } from 'react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { t, locale, toggleLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.categories'), to: '/#categories' },
    { label: t('nav.about'), to: '/#about' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#fafaf9]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-card">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-stone-900">
              {t('nav.brand')}
            </p>
            <p className="text-xs text-stone-500">{t('nav.tagline')}</p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition hover:text-primary ${
                pathname === link.to
                  ? 'text-primary'
                  : 'text-stone-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden h-11 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 shadow-sm transition hover:border-primary hover:text-primary md:inline-flex"
            aria-label="Toggle language"
          >
            <Globe size={15} />
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition hover:border-primary hover:text-primary ${
              pathname === '/cart'
                ? 'border-primary text-primary'
                : 'border-stone-200 text-stone-700'
            }`}
            aria-label={t('nav.cart')}
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow">
                {totalItems}
              </span>
            )}
          </Link>

          {/* CTA button */}
          <Link
            to="/category/vegetables-fruits"
            className="hidden rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 md:inline-flex"
          >
            {t('nav.startShopping')}
          </Link>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-t border-stone-200/80 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-stone-50 hover:text-primary ${
                  pathname === link.to ? 'text-primary bg-primary/5' : 'text-stone-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
            >
              <Globe size={15} />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
