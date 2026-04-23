import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ar from '../i18n/ar';
import en from '../i18n/en';

const translations = { ar, en };

const fallbackTranslations = {
  ar: {
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'auth.loginTitle': 'تسجيل الدخول',
    'auth.loginSubtitle': 'أهلا بعودتك. سجل دخولك لمتابعة التسوق في يلا ماركت.',
    'auth.registerTitle': 'إنشاء حساب',
    'auth.registerSubtitle': 'انضم إلى يلا ماركت واحفظ بياناتك للتسوق بسرعة في المرات القادمة.',
    'auth.fullName': 'الاسم الكامل',
    'auth.email': 'البريد الإلكتروني',
    'auth.phone': 'رقم الهاتف',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء الحساب',
    'auth.loading': 'يرجى الانتظار...',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.createAccount': 'أنشئ حسابا',
    'auth.required': 'هذا الحقل مطلوب',
    'auth.invalidEmail': 'أدخل بريدا إلكترونيا صحيحا',
    'auth.invalidPhone': 'أدخل رقم هاتف صحيحا',
    'auth.shortPassword': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'auth.passwordMismatch': 'كلمتا المرور غير متطابقتين',
    'auth.loginError': 'تعذر تسجيل الدخول. حاول مرة أخرى.',
    'auth.registerError': 'تعذر إنشاء الحساب. حاول مرة أخرى.',
    'auth.registerSuccess': 'تم إنشاء حسابك. يمكنك تسجيل الدخول الآن.',
  },
};

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
      return (
        key.split('.').reduce((obj, k) => obj?.[k], strings) ||
        fallbackTranslations[locale]?.[key] ||
        key
      );
    },
    [locale, strings]
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
