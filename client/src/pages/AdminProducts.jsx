import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const EMPTY_FORM = {
  name: '', name_en: '', description: '', description_en: '',
  price: '', unit: '', stock: '', image: '', badge: '', category_id: '',
};

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API}/api/products?limit=1000`),
        fetch(`${API}/api/categories`),
      ]);
      if (!pRes.ok || !cRes.ok) throw new Error();
      setProducts(await pRes.json());
      setCategories(await cRes.json());
    } catch {
      setError('تعذر تحميل البيانات. تأكد من تشغيل الخادم.');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal('add');
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      name_en: product.name_en || '',
      description: product.description || '',
      description_en: product.description_en || '',
      price: product.price,
      unit: product.unit || '',
      stock: product.stock,
      image: product.image || '',
      badge: product.badge || '',
      category_id: product.category_id,
    });
    setFormError(null);
    setModal('edit');
  }

  function closeModal() { setModal(null); setEditing(null); }

  async function handleSave() {
    if (!form.name || form.price === '' || !form.category_id) {
      setFormError('الاسم والسعر والفئة مطلوبة');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };
      const url = modal === 'edit'
        ? `${API}/api/products/${editing.id}`
        : `${API}/api/products`;
      const res = await fetch(url, {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'خطأ في الحفظ');
      closeModal();
      await load();
    } catch (err) {
      setFormError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error();
      setDeleteId(null);
      await load();
    } catch {
      alert('تعذر حذف المنتج');
    }
  }

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || '—';
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6" dir="rtl">
        <div>
          <h1 className="text-xl font-bold text-stone-800">إدارة المنتجات</h1>
          <p className="text-stone-500 text-sm mt-0.5">{products.length} منتج</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner /></div>}
      {error && <ErrorBanner msg={error} />}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto" dir="rtl">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {['#', 'الاسم', 'الفئة', 'السعر', 'المخزون', 'الحالة', ''].map((h) => (
                  <th key={h} className="text-right px-4 py-3 font-medium text-stone-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 text-stone-400">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{categoryName(p.category_id)}</td>
                  <td className="px-4 py-3 text-stone-700">₪ {Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {p.inStock ? 'متوفر' : 'نفذ'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-stone-400">لا توجد منتجات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'إضافة منتج جديد' : 'تعديل المنتج'} onClose={closeModal}>
          <div className="grid grid-cols-2 gap-3" dir="rtl">
            <Field label="الاسم بالعربية *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="الاسم بالإنجليزية" value={form.name_en} onChange={(v) => setForm((f) => ({ ...f, name_en: v }))} />
            <Field label="الوصف بالعربية" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
            <Field label="الوصف بالإنجليزية" value={form.description_en} onChange={(v) => setForm((f) => ({ ...f, description_en: v }))} />
            <Field label="السعر (₪) *" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} />
            <Field label="الوحدة (كيلو، قطعة...)" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} />
            <Field label="المخزون" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-600">الفئة *</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="">اختر فئة</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="رابط الصورة" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
            <Field label="البادج (جديد، عرض...)" value={form.badge} onChange={(v) => setForm((f) => ({ ...f, badge: v }))} />
          </div>

          {formError && <p className="text-red-600 text-sm mt-3 text-right">{formError}</p>}

          <div className="flex gap-2 justify-start mt-5">
            <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Spinner /> : <Check className="w-4 h-4" />}
              حفظ
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeleteId(null)}>
          <p className="text-stone-600 text-sm mb-5 text-right">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.</p>
          <div className="flex gap-2 justify-start">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
              إلغاء
            </button>
            <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
              حذف
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-bold text-stone-800">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">{msg}</div>
  );
}
