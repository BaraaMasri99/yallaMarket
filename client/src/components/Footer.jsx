import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToNewsletter } from '../services/newsletterService';

const contactInfo = [
  { icon: Phone, text: '0599-123-456' },
  { icon: Mail, text: 'info@yallamarket.ps' },
  { icon: MapPin, text: 'نابلس، فلسطين' },
  { icon: Clock, text: 'يومياً من 8 صباحاً - 11 مساءً' },
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ type: '', message: '' });
  const [isSubscribing, setIsSubscribing] = useState(false);

  const quickLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.categories'), to: '/#categories' },
    { label: t('nav.about'), to: '/#about' },
    { label: t('footer.privacy'), to: '/' },
  ];

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    setNewsletterStatus({ type: '', message: '' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus({
        type: 'error',
        message: t('footer.invalidEmail'),
      });
      return;
    }

    setIsSubscribing(true);

    try {
      await subscribeToNewsletter(email);
      setNewsletterEmail('');
      setNewsletterStatus({
        type: 'success',
        message: t('footer.subscribeSuccess'),
      });
    } catch (error) {
      setNewsletterStatus({
        type: 'error',
        message:
          error.status === 409
            ? t('footer.alreadySubscribed')
            : t('footer.subscribeError'),
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">

          {/* ── Brand ── */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-lg font-black">{t('nav.brand')}</p>
                <p className="text-xs text-stone-400">{t('nav.tagline')}</p>
              </div>
            </Link>
            <p className="text-sm leading-7 text-stone-400">
              {t('footer.description')}
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 text-stone-400 transition hover:bg-primary hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-stone-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              {t('footer.contactUs')}
            </h3>
            <ul className="space-y-3">
              {contactInfo.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-stone-400">
                  <Icon size={16} className="shrink-0 text-stone-500" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              {t('footer.newsletter')}
            </h3>
            <p className="mb-4 text-sm leading-7 text-stone-400">
              {t('footer.newsletterText')}
            </p>
            <form className="space-y-2" onSubmit={handleNewsletterSubmit}>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  disabled={isSubscribing}
                  className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubscribing ? t('footer.subscribing') : t('footer.subscribe')}
                </button>
              </div>
              {newsletterStatus.message && (
                <p
                  className={`text-xs ${
                    newsletterStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {newsletterStatus.message}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-6 text-xs text-stone-500 md:flex-row">
          <p>© {new Date().getFullYear()} {t('nav.brand')}. {t('footer.rights')}</p>
          <p>{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
