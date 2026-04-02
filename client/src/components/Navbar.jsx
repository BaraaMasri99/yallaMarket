import { Menu, Search, ShoppingBag } from 'lucide-react';

const navLinks = ['الرئيسية', 'العروض', 'الأقسام', 'عن يلا ماركت'];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#fafaf9]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-card">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-stone-900">يلا ماركت</p>
            <p className="text-xs text-stone-500">Fresh picks, delivered fast</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-semibold text-stone-700 transition hover:text-primary"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-medium text-stone-600 shadow-sm md:inline-flex"
          >
            <Search size={16} />
            ابحث عن منتجاتك
          </button>
          <button
            type="button"
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            ابدأ التسوق
          </button>
        </div>
      </div>
    </header>
  );
}
