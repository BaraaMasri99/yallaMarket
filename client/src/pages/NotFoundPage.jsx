import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <h1 className="text-[8rem] font-black leading-none text-stone-200 md:text-[12rem]">
        404
      </h1>

      <h2 className="mt-2 text-2xl font-black text-stone-900">
        {t('notFound.title')}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-7 text-stone-500">
        {t('notFound.text')}
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-card transition hover:bg-primary"
      >
        <Home size={16} />
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
