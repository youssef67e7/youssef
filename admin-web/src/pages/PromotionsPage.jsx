import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Megaphone, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { promotionsAPI } from '../services/api';

const emptyForm = {
  title: '', description: '', discountType: 'percentage', discountValue: '',
  startDate: '', endDate: '', isActive: true,
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await promotionsAPI.list();
      const d = data.data || data;
      setPromotions(d.promotions || d.items || d || []);
    } catch {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const filtered = search
    ? promotions.filter((p) => (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    : promotions;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '', description: p.description || '',
      discountType: p.discountType || 'percentage', discountValue: p.discountValue ?? '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '', isActive: p.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.discountValue || Number(form.discountValue) <= 0) return toast.error('Discount value must be greater than 0');
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue) };
      if (editing) {
        await promotionsAPI.update(editing._id || editing.id, payload);
        toast.success('Promotion updated');
      } else {
        await promotionsAPI.create(payload);
        toast.success('Promotion created');
      }
      setModalOpen(false);
      fetchPromotions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await promotionsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Promotion deleted');
      fetchPromotions();
    } catch {
      toast.error('Failed to delete promotion');
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional campaigns</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Promotion
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search promotions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 space-y-3 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No promotions found" description={search ? 'Try a different search term' : 'Create your first promotion'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p._id || p.id} className="bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description || 'No description'}</p>
                </div>
                <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${p.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-primary-600">
                  {p.discountValue}{p.discountType === 'percentage' ? '%' : '$'} off
                </span>
                {p.startDate && <span className="text-gray-400">{new Date(p.startDate).toLocaleDateString()}</span>}
              </div>
              <div className="flex items-center gap-1 pt-2 border-t mt-auto">
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil size={16} /></button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Promotion' : 'Add Promotion'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Promotion title" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Promotion description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Discount Type</label>
              <select className={inputClass} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Discount Value *</label>
              <input type="number" min="0" className={inputClass} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
