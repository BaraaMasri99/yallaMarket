import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { AuthInput, AuthShell, FormError } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { registerUser } from '../services/authService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = t('auth.required');

    if (!values.email.trim()) {
      nextErrors.email = t('auth.required');
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = t('auth.invalidEmail');
    }

    if (!values.phone.trim()) {
      nextErrors.phone = t('auth.required');
    } else if (!phoneRegex.test(values.phone.trim())) {
      nextErrors.phone = t('auth.invalidPhone');
    }

    if (!values.password) {
      nextErrors.password = t('auth.required');
    } else if (values.password.length < 6) {
      nextErrors.password = t('auth.shortPassword');
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = t('auth.required');
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = t('auth.passwordMismatch');
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
      const data = await registerUser({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      });

      if (data?.token || data?.user) {
        login(data);
        navigate('/', { replace: true });
        return;
      }

      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      setServerError(error.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')} wide>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            label={t('auth.fullName')}
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={errors.fullName}
            autoComplete="name"
          />
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
            label={t('auth.phone')}
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            autoComplete="tel"
            dir="ltr"
          />
          <AuthInput
            label={t('auth.password')}
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <AuthInput
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          {serverError && <FormError>{serverError}</FormError>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-action-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UserPlus size={18} />
            {loading ? t('auth.loading') : t('auth.register')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-bold text-action transition hover:text-action-dark">
            {t('auth.login')}
          </Link>
        </p>
    </AuthShell>
  );
}
