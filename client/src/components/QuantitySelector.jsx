import { Minus, Plus } from 'lucide-react';

/**
 * Reusable +/– quantity selector.
 * @param {{ qty: number, onChange: (n: number) => void, min?: number, max?: number }} props
 */
export default function QuantitySelector({ qty, onChange, min = 1, max = 99 }) {
  return (
    <div className="inline-flex items-center gap-0 rounded-xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
        className="flex h-9 w-9 items-center justify-center rounded-s-xl text-stone-600 transition hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="flex h-9 w-10 items-center justify-center text-sm font-bold text-stone-800 select-none">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        className="flex h-9 w-9 items-center justify-center rounded-e-xl text-stone-600 transition hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
