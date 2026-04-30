import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../services/categoryService';
import { getProductsByCategory } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import BackLink from '../components/BackLink';
import { getDisplayCategoryName, normalizeSearchText } from '../utils/helpers';
import { Package, Home, Search, X } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, locale } = useLanguage();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setSearchQuery('');

    (async () => {
      try {
        const cat = await getCategoryBySlug(slug);
        if (cancelled) return;
        setCategory(cat);

        if (cat) {
          const prods = await getProductsByCategory(cat.id);
          if (!cancelled) setProducts(prods);
        } else if (!cancelled) {
          setProducts([]);
        }
      } catch {
        if (!cancelled) {
          setCategory(null);
          setProducts([]);
          setError(t('general.error'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug, t]);

  const categoryName = getDisplayCategoryName(category, locale);
  const filteredProducts = useMemo(() => {
    const q = normalizeSearchText(searchQuery);
    if (!q) return products;
    return products.filter((product) =>
      [
        product.name,
        product.nameEn,
        product.name_en,
        product.description,
        product.descriptionEn,
        product.description_en,
      ].some((value) => normalizeSearchText(value).includes(q))
    );
  }, [products, searchQuery]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
            <Package size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-700">{t('general.error')}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">
            {error}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-card transition hover:bg-primary"
          >
            <Home size={16} />
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
            <Package size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-700">{t('notFound.title')}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">
            {t('notFound.categoryText')}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-card transition hover:bg-primary"
          >
            <Home size={16} />
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.categories'), to: '/' },
          { label: categoryName },
        ]}
      />

      {/* Back link */}
      <BackLink to="/" label={t('cart.continueShopping')} className="mt-4" />

      {/* Category header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} shadow-md`}
          >
            <span className="text-2xl">{category.emoji}</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 md:text-3xl">
              {categoryName}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {products.length} {t('categories.productsCount')}
            </p>
          </div>
        </div>
      </div>

      {/* FR-03: Search/filter within the selected category */}
      <div className="mb-8 flex max-w-xl items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 shadow-sm">
        <Search size={18} className="shrink-0 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('categories.searchPlaceholder')}
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

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <Package size={28} />
          </div>
          <p className="text-stone-500">
            {searchQuery ? t('categories.noSearchResults') : t('categories.emptyText')}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm font-semibold text-primary transition hover:brightness-110"
            >
              {t('hero.clearSearch')}
            </button>
          ) : (
            <BackLink to="/" label={t('cart.browseCta')} className="mt-4" />
          )}
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
