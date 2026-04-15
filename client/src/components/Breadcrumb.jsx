import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Breadcrumb navigation component.
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 *   – items: array of { label, to }. The last item has no `to` (current page).
 */
export default function Breadcrumb({ items = [] }) {
  const { t, locale } = useLanguage();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-stone-500 flex-wrap"
    >
      <Link
        to="/"
        className="flex items-center gap-1 transition hover:text-primary"
      >
        <Home size={14} />
        <span>{t('breadcrumb.home')}</span>
      </Link>

      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-2">
          <Chevron size={14} className="text-stone-300" />
          {item.to ? (
            <Link to={item.to} className="transition hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-stone-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
