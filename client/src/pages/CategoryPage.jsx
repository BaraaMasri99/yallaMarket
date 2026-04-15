import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../services/categoryService';
import { getProductsByCategory } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import BackLink from '../components/BackLink';
import { Package, Home } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const cat = await getCategoryBySlug(slug);
      if (cancelled) return;
      setCategory(cat);

      if (cat) {
        const prods = await getProductsByCategory(cat.id);
        if (!cancelled) setProducts(prods);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Spinner />;

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
          { label: category.name },
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
              {category.name}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {products.length} {t('categories.productsCount')}
            </p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <Package size={28} />
          </div>
          <p className="text-stone-500">{t('categories.emptyText')}</p>
          <BackLink to="/" label={t('cart.browseCta')} className="mt-4" />
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
