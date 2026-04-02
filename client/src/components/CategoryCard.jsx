export default function CategoryCard({ category }) {
  const { name, emoji, image, gradient } = category;
  const hasImage = image && image.trim() !== '';

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-card hover:-translate-y-1"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-5xl drop-shadow-md transition-transform duration-500 group-hover:scale-125">
              {emoji}
            </span>
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />
      </div>

      {/* Label */}
      <div className="px-3 py-3 text-center">
        <h3 className="text-sm font-bold leading-6 text-stone-800 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
      </div>
    </article>
  );
}
