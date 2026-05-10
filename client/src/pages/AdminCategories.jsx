import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '../services/adminService';

const EMPTY_FORM = {
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  image: '',
  slug: '',
};

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => { load(); }, [sort]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getAdminCategories(token, { sort }));
    } catch {
      setError('تعذر تحميل الفئات. تأكد من تشغيل الخادم وصلاحيات حساب المدير.');
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((category) => {
      return [
        category.name_ar || category.name,
        category.name_en,
        category.slug,
      ].some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [categories, query]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setSlugEdited(false);
    setFormError(null);
    setModal('add');
  }

  function openEdit(category) {
    setEditing(category);
    setForm({
      name_ar: category.name_ar || category.name || '',
      name_en: category.name_en || '',
      description_ar: category.description_ar || '',
      description_en: category.description_en || '',
      image: category.image || '',
      slug: category.slug || '',
    });
    setSlugEdited(true);
    setFormError(null);
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setFormError(null);
  }

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if ((field === 'name_en' || field === 'name_ar') && !slugEdited) {
        next.slug = slugify(field === 'name_en' && value ? value : next.name_ar);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.name_ar.trim() || !form.name_en.trim() || !form.slug.trim()) {
      setFormError('الاسم العربي والإنجليزي والرابط المختصر مطلوبة');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (modal === 'edit') {
        await updateAdminCategory(editing.id, form, token);
        setNotice({ type: 'success', text: 'تم تحديث الفئة بنجاح' });
      } else {
        await createAdminCategory(form, token);
        setNotice({ type: 'success', text: 'تمت إضافة الفئة بنجاح' });
      }
      closeModal();
      await load();
    } catch (err) {
      setFormError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteAdminCategory(deleteTarget.id, token);
      setDeleteTarget(null);
      setNotice({ type: 'success', text: 'تم حذف الفئة بنجاح' });
      await load();
    } catch (err) {
      setDeleteTarget(null);
      setNotice({
        type: 'error',
        text: err.status === 409
          ? 'لا يمكن حذف فئة تحتوي على منتجات. انقل المنتجات أو احذفها أولا.'
          : err.message || 'تعذر حذف الفئة',
      });
    }
  }

  return (
    <AdminLayout>
      <div dir="rtl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-800">إدارة الفئات</h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {categories.length} فئة في قاعدة البيانات
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            <Plus className="h-4 w-4" />
            إضافة فئة
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالاسم العربي أو الإنجليزي"
              className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pe-4 ps-10 pr-10 text-sm outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
          >
            <option value="newest">الأحدث أولا</option>
            <option value="products">الأكثر منتجات</option>
            <option value="name">الاسم</option>
          </select>
        </div>

        {notice && (
          <div className={`mb-4 rounded-xl border px-5 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            {notice.text}
          </div>
        )}

        {loading && <CategoryTableSkeleton />}
        {error && <ErrorBanner msg={error} />}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  {['الصورة', 'الاسم العربي', 'الاسم الإنجليزي', 'الرابط', 'عدد المنتجات', ''].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-right font-medium text-stone-600">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <CategoryImage category={category} />
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {category.name_ar || category.name}
                    </td>
                    <td className="px-4 py-3 text-stone-600" dir="ltr">
                      {category.name_en || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600" dir="ltr">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {category.products_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState hasSearch={Boolean(query.trim())} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <Modal
            title={modal === 'add' ? 'إضافة فئة جديدة' : 'تعديل الفئة'}
            onClose={closeModal}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="الاسم بالعربية *"
                value={form.name_ar}
                onChange={(value) => updateForm('name_ar', value)}
              />
              <Field
                label="الاسم بالإنجليزية *"
                value={form.name_en}
                onChange={(value) => updateForm('name_en', value)}
                dir="ltr"
              />
              <Field
                label="الوصف بالعربية"
                value={form.description_ar}
                onChange={(value) => updateForm('description_ar', value)}
                textarea
              />
              <Field
                label="الوصف بالإنجليزية"
                value={form.description_en}
                onChange={(value) => updateForm('description_en', value)}
                textarea
                dir="ltr"
              />
              <Field
                label="رابط الصورة أو اتركه فارغا"
                value={form.image}
                onChange={(value) => updateForm('image', value)}
                dir="ltr"
              />
              <Field
                label="الرابط المختصر *"
                value={form.slug}
                onChange={(value) => {
                  setSlugEdited(true);
                  updateForm('slug', slugify(value));
                }}
                dir="ltr"
              />
            </div>

            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

            <div className="mt-5 flex justify-start gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
              >
                {saving ? <Spinner /> : <Check className="h-4 w-4" />}
                حفظ
              </button>
            </div>
          </Modal>
        )}

        {deleteTarget && (
          <Modal title="تأكيد الحذف" onClose={() => setDeleteTarget(null)}>
            <p className="mb-2 text-sm text-stone-700">
              هل تريد حذف فئة <span className="font-semibold">{deleteTarget.name_ar || deleteTarget.name}</span>؟
            </p>
            {deleteTarget.products_count > 0 && (
              <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                تحتوي هذه الفئة على {deleteTarget.products_count} منتجات، لذلك سيمنع الخادم حذفها.
              </p>
            )}
            <div className="flex justify-start gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}

function CategoryImage({ category }) {
  const source = category.image || '/images/placeholder.svg';

  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 text-stone-400">
      {source ? (
        <img
          src={source}
          alt=""
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <ImageIcon className="h-5 w-5" />
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea = false, dir = 'rtl' }) {
  const className = 'rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200';

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          dir={dir}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir={dir}
          className={className}
        />
      )}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" dir="rtl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold text-stone-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 transition-colors hover:text-stone-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <ImageIcon className="h-5 w-5" />
      </div>
      <p className="font-medium text-stone-700">
        {hasSearch ? 'لا توجد فئات مطابقة للبحث' : 'لا توجد فئات بعد'}
      </p>
      <p className="mt-1 text-sm text-stone-400">
        {hasSearch ? 'جرّب كلمة بحث أخرى.' : 'ابدأ بإضافة أول فئة للمتجر.'}
      </p>
    </div>
  );
}

function CategoryTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[64px_1fr_1fr_1fr_120px_90px] gap-4 border-b border-stone-100 px-4 py-4 last:border-b-0">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-5 animate-pulse self-center rounded bg-stone-100" />
          <div className="h-5 animate-pulse self-center rounded bg-stone-100" />
          <div className="h-5 animate-pulse self-center rounded bg-stone-100" />
          <div className="h-5 animate-pulse self-center rounded bg-stone-100" />
          <div className="h-5 animate-pulse self-center rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      {msg}
    </div>
  );
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
