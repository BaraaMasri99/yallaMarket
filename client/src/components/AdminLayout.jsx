import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'الإحصائيات', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" dir="rtl">
      {/* Top header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2 text-stone-800 font-bold text-lg">
          <LayoutDashboard className="w-5 h-5 text-emerald-600" />
          لوحة تحكم يلا ماركت
        </span>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          العودة للمتجر
        </Link>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-l border-stone-200 flex flex-col gap-1 p-3 shrink-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
