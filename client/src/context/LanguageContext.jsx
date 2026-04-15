import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ar from '../i18n/ar';
import en from '../i18n/en';

const translations = { ar, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('ym-lang') || 'ar';
  });

  const strings = translations[locale] || ar;

  // Update document dir & lang when locale changes
  useEffect(() => {
    document.documentElement.dir = strings.dir;
    document.documentElement.lang = strings.lang;
    localStorage.setItem('ym-lang', locale);
  }, [locale, strings]);

  const toggleLanguage = useCallback(() => {
    setLocale((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  // Helper: t('nav.brand') → translations[locale].nav.brand
  const t = useCallback(
    (key) => {
      return key.split('.').reduce((obj, k) => obj?.[k], strings) || key;
    },
    [strings]
  );

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, t, dir: strings.dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
