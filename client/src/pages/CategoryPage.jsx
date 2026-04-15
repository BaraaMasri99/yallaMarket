import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryBySlug } from '../services/categoryService';
import { getProductsByCategory } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { Package } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, locale } = useLanguage();
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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-stone-500">{t('notFound.title')}</p>
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
          <p className="text-stone-500">لا توجد منتجات في هذا القسم بعد</p>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
