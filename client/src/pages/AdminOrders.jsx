import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../services/orderService';

const STATUSES = [
  { value: 'pending',   label: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'confirmed', label: 'مؤكد',          color: 'bg-blue-50 text-blue-700' },
  { value: 'shipped',   label: 'قيد الشحن',     color: 'bg-purple-50 text-purple-700' },
  { value: 'delivered', label: 'تم التسليم',    color: 'bg-emerald-50 text-emerald-700' },
  { value: 'cancelled', label: 'ملغي',          color: 'bg-red-50 text-red-600' },
];

function statusMeta(value) {
  return STATUSES.find((s) => s.value === value) || STATUSES[0];
}

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getAllOrders(token));
    } catch {
      setError('تعذر تحميل الطلبات. تأكد من تشغيل الخادم.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, status) {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch {
      alert('تعذر تحديث الحالة');
    } finally {
      setUpdating(null);
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6" dir="rtl">
        <div>
          <h1 className="text-xl font-bold text-stone-800">إدارة الطلبات</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {orders.length} طلب · إجمالي الإيرادات: ₪ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner /></div>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto" dir="rtl">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {['#', 'العميل', 'عنوان الشحن', 'الإجمالي', 'العناصر', 'التاريخ', 'الحالة'].map((h) => (
                  <th key={h} className="text-right px-4 py-3 font-medium text-stone-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => {
                const meta = statusMeta(order.status);
                const isUpdating = updating === order.id;
                return (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 text-stone-400">{order.id}</td>
                    <td className="px-4 py-3 text-stone-700">م. {order.user_id}</td>
                    <td className="px-4 py-3 text-stone-600 max-w-[160px] truncate">{order.shipping_address}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">₪ {Number(order.total_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-stone-500">
                      {Array.isArray(order.items) ? order.items.length : '—'} عناصر
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50 bg-white"
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {isUpdating && <Spinner />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-stone-400">لا توجد طلبات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
