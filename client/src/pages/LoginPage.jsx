import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import { AuthInput, AuthShell, FormError } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loginUser } from '../services/authService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = t('auth.required');
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = t('auth.invalidEmail');
    }

    if (!values.password) {
      nextErrors.password = t('auth.required');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const data = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });
      login(data);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      {location.state?.registered && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-action/20 bg-action/10 px-4 py-3 text-sm font-semibold text-action">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{t('auth.registerSuccess')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthInput
          label={t('auth.email')}
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          dir="ltr"
        />
        <AuthInput
          label={t('auth.password')}
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        {serverError && <FormError>{serverError}</FormError>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-action-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn size={18} />
          {loading ? t('auth.loading') : t('auth.login')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-bold text-action transition hover:text-action-dark">
          {t('auth.createAccount')}
        </Link>
      </p>
    </AuthShell>
  );
}
