import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock3,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { useLanguage } from '../context/LanguageContext';
import { getAllCategories } from '../services/categoryService';
import { getAllProducts } from '../services/productService';
import { normalizeSearchText } from '../utils/helpers';

/* ─── component ─── */

export default function Home() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [cats, allProducts] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setProducts(allProducts);
        }
      } catch {
        if (!cancelled) setError(t('general.error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredProducts = useMemo(() => {
    if (!isSearching) return [];
    const q = normalizeSearchText(searchQuery);
    return products.filter(
      (product) =>
        normalizeSearchText(product.name).includes(q) ||
        normalizeSearchText(product.nameEn).includes(q) ||
        normalizeSearchText(product.name_en).includes(q) ||
        normalizeSearchText(product.description).includes(q) ||
        normalizeSearchText(product.descriptionEn).includes(q) ||
        normalizeSearchText(product.description_en).includes(q)
    );
  }, [isSearching, products, searchQuery]);

  const highlights = [
    {
      icon: Clock3,
      title: t('highlights.fastDelivery'),
      text: t('highlights.fastDeliveryText'),
    },
    {
      icon: Leaf,
      title: t('highlights.freshProducts'),
      text: t('highlights.freshProductsText'),
    },
    {
      icon: ShieldCheck,
      title: t('highlights.securePayment'),
      text: t('highlights.securePaymentText'),
    },
  ];

  return (
    <>
      {/* ══════ Hero ══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.26),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(22,163,74,0.18),_transparent_28%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
              <Sparkles size={16} />
              {t('hero.badge')}
            </span>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-8 text-stone-600">
              {t('hero.subtitle')}
            </p>

            {/* Search bar */}
            <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 shadow-card">
              <Search size={18} className="text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Highlight cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur transition hover:-translate-y-0.5"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white">
                  <Icon size={20} />
                </div>
                <h2 className="mb-1 font-bold">{title}</h2>
                <p className="text-sm leading-7 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Categories Grid ══════ */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 md:px-6 md:py-16">
        <div className="mb-8 text-center md:text-start">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            {isSearching ? t('nav.search') : t('categories.sectionLabel')}
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {isSearching ? searchQuery : t('categories.sectionTitle')}
          </h2>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-stone-500">{error}</p>
          </div>
        ) : isSearching && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !isSearching && categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <Search size={28} />
            </div>
            <p className="text-stone-500">{t('hero.noResults')}</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm font-semibold text-primary transition hover:brightness-110"
            >
              {t('hero.clearSearch')}
            </button>
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="bg-white scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              {t('about.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
              {t('about.text')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ Delivery CTA ══════ */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 text-white shadow-2xl md:p-12">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-action text-white shadow-lg">
              <Truck size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black md:text-3xl">
                {t('cta.title')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-300">
                {t('cta.text')}
              </p>
            </div>
            <Link
              to="/#categories"
              className="shrink-0 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-110"
            >
              {t('cta.btn')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
