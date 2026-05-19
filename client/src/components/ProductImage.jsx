import { useState } from 'react';
import { getDisplayName, getProductEmoji } from '../utils/helpers';

const CATEGORY_STYLES = {
  1: 'from-emerald-50 via-lime-50 to-amber-50 text-emerald-700',
  2: 'from-lime-50 via-green-50 to-stone-50 text-green-700',
  3: 'from-orange-50 via-amber-50 to-yellow-50 text-orange-700',
  4: 'from-indigo-50 via-violet-50 to-sky-50 text-indigo-700',
  5: 'from-sky-50 via-cyan-50 to-teal-50 text-sky-700',
  6: 'from-rose-50 via-pink-50 to-orange-50 text-rose-700',
  7: 'from-amber-50 via-orange-50 to-red-50 text-orange-700',
  8: 'from-stone-100 via-zinc-50 to-slate-50 text-stone-700',
  9: 'from-blue-50 via-indigo-50 to-cyan-50 text-blue-700',
  10: 'from-red-50 via-rose-50 to-fuchsia-50 text-red-700',
  11: 'from-teal-50 via-emerald-50 to-cyan-50 text-teal-700',
  12: 'from-purple-50 via-pink-50 to-stone-50 text-purple-700',
  13: 'from-pink-50 via-rose-50 to-orange-50 text-pink-700',
  14: 'from-yellow-50 via-amber-50 to-stone-50 text-amber-700',
  15: 'from-orange-50 via-yellow-50 to-lime-50 text-orange-700',
};

export default function ProductImage({
  product,
  locale,
  className = '',
  imageClassName = '',
  iconClassName = 'h-16 w-16 rounded-2xl text-4xl',
  labelClassName = 'mt-3 max-w-[80%] text-xs',
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = getDisplayName(product, locale);
  const emoji = getProductEmoji(product);
  const categoryId = Number(product?.categoryId ?? product?.category_id);
  const style = CATEGORY_STYLES[categoryId] || 'from-stone-50 via-amber-50 to-orange-50 text-stone-700';
  const showRemoteImage = product?.image && !imageFailed;

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${style}`}>
        <div className={`flex items-center justify-center bg-white/70 shadow-sm ${iconClassName}`}>
          <span aria-hidden="true">{emoji}</span>
        </div>
        {labelClassName && (
          <span className={`truncate text-center font-bold ${labelClassName}`}>
            {displayName}
          </span>
        )}
      </div>

      {showRemoteImage && (
        <img
          src={product.image}
          alt={displayName}
          className={`relative z-10 h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
