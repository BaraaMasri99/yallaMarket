import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

/**
 * RTL-aware back navigation link.
 * @param {{ to: string, label: string, className?: string }} props
 */
export default function BackLink({ to, label, className = '' }) {
  const { locale } = useLanguage();
  const Arrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:brightness-110 ${className}`}
    >
      <Arrow size={16} />
      {label}
    </Link>
  );
}
