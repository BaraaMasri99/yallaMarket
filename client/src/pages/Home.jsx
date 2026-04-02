import {
  Clock3,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import { categories } from '../../data/categories';

/* ─── static data ─── */

const highlights = [
  {
    icon: Clock3,
    title: 'توصيل سريع',
    text: 'نوصّل طلبك لباب بيتك بأسرع وقت ممكن.',
  },
  {
    icon: Leaf,
    title: 'منتجات طازجة',
    text: 'خضار وفواكه ولحوم طازجة يومياً من أفضل الموردين.',
  },
  {
    icon: ShieldCheck,
    title: 'دفع آمن',
    text: 'طرق دفع متعددة وآمنة لراحتك.',
  },
];

/* ─── component ─── */

export default function Home() {
  return (
    <div className="min-h-screen text-stone-900">
      <Navbar />

      <main>
        {/* ══════ Hero ══════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.26),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(22,163,74,0.18),_transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
                <Sparkles size={16} />
                يلا ماركت — تسوّق بذكاء
              </span>

              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                كل اللي بيتك محتاجه، بمكان واحد
              </h1>

              <p className="mx-auto max-w-xl text-lg leading-8 text-stone-600">
                تصفّح أقسامنا المتنوعة واطلب منتجاتك المفضلة بسرعة وسهولة.
                خضار طازجة، مخبوزات، لحوم، مشروبات، وأكثر!
              </p>

              {/* Search bar */}
              <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 shadow-card">
                <Search size={18} className="text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
                <button
                  type="button"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition hover:brightness-110"
                >
                  ابحث
                </button>
              </div>
            </div>

            {/* Highlight cards */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
              {highlights.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur transition hover:-translate-y-0.5"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white">
                    <Icon size={20} />
                  </div>
                  <h2 className="mb-1 font-bold">{title}</h2>
                  <p className="text-sm leading-7 text-stone-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ Categories Grid ══════ */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
          <div className="mb-8 text-center md:text-start">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              تصفّح الأقسام
            </p>
            <h2 className="mt-2 text-3xl font-black">اختر القسم اللي بدك إياه</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* ══════ Delivery CTA ══════ */}
        <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-20">
          <div className="rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 text-white shadow-2xl md:p-12">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-action text-white shadow-lg">
                <Truck size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black md:text-3xl">
                  توصيل سريع لحد باب بيتك
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  اختر منتجاتك واستلمها بأسرع وقت. نغطّي جميع المناطق.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-110"
              >
                ابدأ التسوق الآن
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
