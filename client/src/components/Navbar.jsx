import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, LogOut, Menu, Package, ShoppingBag, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t, locale, toggleLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [hash, pathname]);

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.categories'), to: '/#categories' },
    { label: t('nav.about'), to: '/#about' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleAnchorClick = (to) => (event) => {
    if (!to.startsWith('/#') || pathname !== '/' || hash !== to.slice(1)) return;

    event.preventDefault();
    document.getElementById(to.slice(2))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setMobileOpen(false);
  };

  const displayName = currentUser?.full_name || currentUser?.fullName || currentUser?.email || '';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#fafaf9]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

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

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? pathname === '/' && !hash
                : `${pathname}${hash}` === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleAnchorClick(link.to)}
                className={`text-sm font-semibold transition hover:text-primary ${
                  isActive ? 'text-primary' : 'text-stone-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden h-11 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 shadow-sm transition hover:border-primary hover:text-primary md:inline-flex"
            aria-label="Toggle language"
          >
            <Globe size={15} />
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-36 truncate text-sm font-semibold text-stone-700">
                {displayName}
              </span>
              {isAdmin && (
                <Link
                  to="/admin/products"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Package size={16} />
                  Admin Products
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-red-200 hover:text-red-500"
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`hidden h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold shadow-sm transition hover:border-action hover:text-action md:inline-flex ${
                pathname === '/login'
                  ? 'border-action text-action'
                  : 'border-stone-200 text-stone-700'
              }`}
            >
              <UserRound size={16} />
              {t('nav.login')}
            </Link>
          )}

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

          <Link
            to="/#categories"
            onClick={handleAnchorClick('/#categories')}
            className="hidden rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 md:inline-flex"
          >
            {t('nav.startShopping')}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200/80 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? pathname === '/' && !hash
                  : `${pathname}${hash}` === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleAnchorClick(link.to)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-stone-50 hover:text-primary ${
                    isActive ? 'bg-primary/5 text-primary' : 'text-stone-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
            >
              <Globe size={15} />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/products"
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Package size={15} />
                    Admin Products
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-red-500"
                >
                  <LogOut size={15} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-stone-50 hover:text-action ${
                  pathname === '/login' ? 'bg-action/5 text-action' : 'text-stone-700'
                }`}
              >
                <UserRound size={15} />
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
