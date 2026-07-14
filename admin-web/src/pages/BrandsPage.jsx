import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { brandsAPI } from '../services/api';

const emptyForm = { nameEn: '', nameAr: '', description: '', logo: '', isActive: true };

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await brandsAPI.list();
      const d = data.data || data;
      const list = d.brands || d.items || d || [];
      if (search) {
        const q = search.toLowerCase();
        setBrands(list.filter((b) => (b.name || b.nameEn || '').toLowerCase().includes(q) || (b.nameAr || '').toLowerCase().includes(q)));
      } else {
        setBrands(list);
      }
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ nameEn: b.nameEn || b.name || '', nameAr: b.nameAr || '', description: b.description || '', logo: b.logo || '', isActive: b.isActive !== false });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameEn.trim()) return toast.error('English name is required');
    setSaving(true);
    try {
      const payload = { name: form.nameEn, nameEn: form.nameEn, nameAr: form.nameAr, description: form.description, logo: form.logo, isActive: form.isActive };
      if (editing) {
        await brandsAPI.update(editing._id || editing.id, payload);
        toast.success('Brand updated');
      } else {
        await brandsAPI.create(payload);
        toast.success('Brand created');
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await brandsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Brand deleted');
      fetchBrands();
    } catch {
      toast.error('Failed to delete brand');
    }
  };

  const columns = [
    { key: 'nameEn', label: 'Name (EN)', sortable: true, render: (v, row) => <span className="font-medium text-gray-900">{v || row.name}</span> },
    { key: 'nameAr', label: 'Name (AR)', render: (v) => v || '—' },
    { key: 'logo', label: 'Logo', render: (v) => v ? <img src={v} alt="Logo" className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center"><Award size={14} className="text-gray-400" /></div> },
    { key: 'isActive', label: 'Status', render: (v) => (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${v !== false ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
        {v !== false ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: 'Actions', width: '100px', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil size={16} /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage medicine brands</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Brand
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        emptyIcon={Award}
        emptyTitle="No brands found"
        emptyDescription="Create your first brand"
        searchPlaceholder="Search brands..."
        onSearch={setSearch}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name (English) *</label>
            <input className={inputClass} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Brand name" />
          </div>
          <div>
            <label className={labelClass}>Name (Arabic)</label>
            <input className={inputClass} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="الاسم بالعربية" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          </div>
          <div>
            <label className={labelClass}>Logo URL</label>
            <input className={inputClass} value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
            {form.logo && <img src={form.logo} alt="Preview" className="mt-2 h-12 w-12 rounded object-cover" />}
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
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteTarget?.nameEn || deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
