import { AlertCircle } from 'lucide-react';

export function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-stone-50 px-4 py-12 md:px-6">
      <section
        className={`w-full rounded-3xl border border-stone-200/80 bg-white p-6 shadow-card sm:p-8 ${
          wide ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-black text-stone-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}

export function AuthInput({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  dir,
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        dir={dir}
        className={`w-full rounded-xl border bg-stone-50 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-primary'
        }`}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
