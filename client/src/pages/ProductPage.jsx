import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../services/productService';
import { getCategoryById } from '../services/categoryService';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getDisplayName, getDisplayDescription, formatPrice } from '../utils/helpers';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import BackLink from '../components/BackLink';
import Spinner from '../components/Spinner';
import { ShoppingCart, Check } from 'lucide-react';

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setQty(1);
    setAdded(false);

    (async () => {
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
      }
      setLoading(false);
    })();

    // Scroll to top on product change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    // Add the product with the selected quantity in a single action
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <Spinner />;

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-stone-500">{t('notFound.title')}</p>
      </div>
    );
  }

  const displayName = getDisplayName(product, locale);
  const displayDesc = getDisplayDescription(product, locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          ...(category
            ? [{ label: category.name, to: `/category/${category.slug}` }]
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
          <img
            src={product.image}
            alt={displayName}
            className="aspect-square w-full object-cover"
          />
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
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm">
              <span>{category.emoji}</span>
              {category.name}
            </span>
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
