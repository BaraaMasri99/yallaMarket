import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Package, Users } from 'lucide-react';
import Spinner from '../components/Spinner';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API}/api/products?limit=1000`),
          fetch(`${API}/api/orders`, { headers: authHeaders }),
        ]);

        if (!productsRes.ok || !ordersRes.ok) throw new Error('Failed to load stats');

        const products = await productsRes.json();
        const orders = await ordersRes.json();

        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

        if (!cancelled) {
          setStats({
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue,
            totalUsers: '—',  // replace once users API is built
          });
        }
      } catch (err) {
        if (!cancelled) setError('تعذر تحميل الإحصائيات. تأكد من تشغيل الخادم.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">الإحصائيات العامة</h1>
        <p className="text-stone-500 text-sm mb-8">نظرة عامة على حالة المتجر</p>

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={<ShoppingBag className="w-6 h-6" />}
              label="إجمالي الطلبات"
              value={stats.totalOrders}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="إجمالي الإيرادات"
              value={`₪ ${Number(stats.totalRevenue).toFixed(2)}`}
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={<Package className="w-6 h-6" />}
              label="إجمالي المنتجات"
              value={stats.totalProducts}
              color="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="إجمالي المستخدمين"
              value={stats.totalUsers}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-stone-500 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}
