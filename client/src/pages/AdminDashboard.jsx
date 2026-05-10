import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  DollarSign,
  FolderTree,
  Package,
  ShoppingBag,
  Timer,
  Users,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/adminService';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const nextStats = await getDashboardStats(token);
        if (!cancelled) setStats(nextStats);
      } catch (error) {
        if (!cancelled) {
          const details = error?.status
            ? ` (HTTP ${error.status}${error?.message ? `: ${error.message}` : ''})`
            : '';
          setError(`تعذر تحميل الإحصائيات. تأكد من تشغيل الخادم وصلاحيات المدير${details}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, [token]);

  const cards = useMemo(() => ([
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      label: 'إجمالي الطلبات',
      value: stats?.totalOrders || 0,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      label: 'إجمالي المبيعات',
      value: stats?.totalSales || 0,
      prefix: '₪ ',
      decimals: 2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: <Package className="h-6 w-6" />,
      label: 'إجمالي المنتجات',
      value: stats?.totalProducts || 0,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: <FolderTree className="h-6 w-6" />,
      label: 'إجمالي الفئات',
      value: stats?.totalCategories || 0,
      color: 'bg-cyan-50 text-cyan-700',
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: 'إجمالي المستخدمين',
      value: stats?.totalUsers || 0,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: <Timer className="h-6 w-6" />,
      label: 'طلبات قيد الانتظار',
      value: stats?.pendingOrders || 0,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      label: 'منتجات نفد مخزونها',
      value: stats?.outOfStockProducts || 0,
      color: 'bg-red-50 text-red-600',
    },
  ]), [stats]);

  return (
    <AdminLayout>
      <div dir="rtl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-stone-800">الإحصائيات العامة</h1>
          <p className="text-sm text-stone-500">نظرة عامة مباشرة من قاعدة بيانات يلا ماركت</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 7 }).map((_, index) => <StatSkeleton key={index} />)
            : cards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, prefix = '', decimals = 0, color }) {
  const displayValue = Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="mb-1 text-sm text-stone-500">{label}</p>
      <p className="text-2xl font-bold text-stone-800">{prefix}{displayValue}</p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-12 w-12 rounded-xl bg-stone-100" />
      <div className="mb-3 h-4 w-24 rounded bg-stone-100" />
      <div className="h-8 w-20 rounded bg-stone-100" />
    </div>
  );
}
