import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../services/productService';
import { getCategoryById } from '../services/categoryService';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatPrice,
  getDisplayCategoryName,
  getDisplayDescription,
  getDisplayName,
  getProductEmoji,
} from '../utils/helpers';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import BackLink from '../components/BackLink';
import Spinner from '../components/Spinner';
import { ShoppingCart, Check, Home } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { t, locale } = useLanguage();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setQty(1);
    setAdded(false);

    (async () => {
      try {
        const prod = await getProductById(Number(id));
        if (cancelled) return;
        setProduct(prod);

        if (prod) {
          const [cat, rel] = await Promise.all([
            getCategoryById(prod.categoryId),
            getRelatedProducts(prod.id, 4),
          ]);
          if (!cancelled) {
            setCategory(cat);
            setRelated(rel);
          }
        } else if (!cancelled) {
          setCategory(null);
          setRelated([]);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setCategory(null);
          setRelated([]);
          setError(t('general.error'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, t]);

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
            <ShoppingCart size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-700">{t('general.error')}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">{error}</p>
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

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
            <ShoppingCart size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-700">{t('notFound.title')}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">
            {t('notFound.productText')}
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

  const displayName = getDisplayName(product, locale);
  const displayDesc = getDisplayDescription(product, locale);
  const categoryName = getDisplayCategoryName(category, locale);
  const emoji = getProductEmoji(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          ...(category
            ? [{ label: categoryName, to: `/category/${category.slug}` }]
            : []),
          { label: displayName },
        ]}
      />

      {/* Back link */}
      {category && (
        <BackLink
          to={`/category/${category.slug}`}
          label={t('product.backToCategory')}
          className="mt-4"
        />
      )}

      {/* Product details */}
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-50 shadow-sm">
          {product.image ? (
            <img
              src={product.image}
              alt={displayName}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 text-7xl md:text-8xl">
              <span aria-hidden="true">{emoji}</span>
            </div>
          )}
          {product.badge && (
            <span className="absolute top-4 start-4 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-md">
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Category tag */}
          {category && (
            <Link
              to={`/category/${category.slug}`}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm transition hover:border-primary hover:text-primary"
            >
              <span>{category.emoji}</span>
              {categoryName}
            </Link>
          )}

          <h1 className="text-3xl font-black text-stone-900 leading-tight">
            {displayName}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-lg text-stone-500">{t('product.currency')}</span>
            <span className="text-sm text-stone-400">/ {product.unit}</span>
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                product.inStock ? 'bg-action' : 'bg-red-400'
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                product.inStock ? 'text-action' : 'text-red-500'
              }`}
            >
              {product.inStock ? t('product.inStock') : t('product.outOfStock')}
            </span>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <h2 className="mb-2 text-sm font-bold text-stone-700">
              {t('product.description')}
            </h2>
            <p className="text-sm leading-7 text-stone-600">{displayDesc}</p>
          </div>

          {/* Add to cart */}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {product.inStock && (
              <QuantitySelector qty={qty} onChange={setQty} />
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || added}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-card transition-all duration-300 ${
                added
                  ? 'bg-action'
                  : product.inStock
                  ? 'bg-stone-900 hover:bg-primary'
                  : 'bg-stone-300 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  {t('product.added')}
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {t('product.addToCart')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-black text-stone-900">
            {t('product.relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="h-12" />
    </div>
  );
}
