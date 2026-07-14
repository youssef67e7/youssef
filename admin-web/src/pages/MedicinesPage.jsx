import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { medicinesAPI, categoriesAPI, brandsAPI } from '../services/api';

const emptyForm = {
  name: '', nameAr: '', category: '', brand: '', price: '', stock: '',
  SKU: '', dosageForm: '', manufacturer: '', description: '',
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await medicinesAPI.list(params);
      const d = data.data || data;
      const raw = d.medicines || d.items || d || [];
      setMedicines(Array.isArray(raw) ? raw : []);
      setTotalPages(d.totalPages || d.totalPages || 1);
      setTotal(d.total || d.totalItems || 0);
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  useEffect(() => {
    categoriesAPI.list().then(({ data }) => {
      const d = data?.data || data;
      setCategories(Array.isArray(d?.categories || d) ? (d.categories || d) : []);
    }).catch(() => {});
    brandsAPI.list().then(({ data }) => {
      const d = data?.data || data;
      setBrands(Array.isArray(d?.brands || d) ? (d.brands || d) : []);
    }).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name || '', nameAr: m.nameAr || '', category: m.category?._id || m.category || '',
      brand: m.brand?._id || m.brand || '', price: m.price ?? '', stock: m.stock ?? '',
      SKU: m.SKU || m.sku || '', dosageForm: m.dosageForm || '', manufacturer: m.manufacturer || '',
      description: m.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.price || Number(form.price) <= 0) return toast.error('Price must be greater than 0');
    if (form.stock === '' || Number(form.stock) < 0) return toast.error('Stock cannot be negative');
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) {
        await medicinesAPI.update(editing._id || editing.id, payload);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(payload);
        toast.success('Medicine created');
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await medicinesAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Medicine deleted');
      fetchMedicines();
    } catch {
      toast.error('Failed to delete medicine');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (_, row) => (
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        {row.nameAr && <p className="text-xs text-gray-400">{row.nameAr}</p>}
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => v?.name || v || '—' },
    { key: 'price', label: 'Price', sortable: true, render: (v) => `$${Number(v || 0).toFixed(2)}` },
    { key: 'stock', label: 'Stock', sortable: true, render: (v) => (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${v <= 0 ? 'bg-red-50 text-red-600' : v <= 10 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
        {v}
      </span>
    )},
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
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your medicine catalog</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      <DataTable
        columns={columns}
        data={medicines}
        loading={loading}
        emptyIcon={Pill}
        emptyTitle="No medicines found"
        emptyDescription="Add your first medicine to get started"
        searchPlaceholder="Search medicines..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Medicine name" />
          </div>
          <div>
            <label className={labelClass}>Name (Arabic)</label>
            <input className={inputClass} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="الاسم بالعربية" />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <select className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
              <option value="">Select brand</option>
              {brands.map((b) => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Price *</label>
            <input type="number" step="0.01" min="0" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Stock *</label>
            <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input className={inputClass} value={form.SKU} onChange={(e) => setForm({ ...form, SKU: e.target.value })} placeholder="SKU code" />
          </div>
          <div>
            <label className={labelClass}>Dosage Form</label>
            <input className={inputClass} value={form.dosageForm} onChange={(e) => setForm({ ...form, dosageForm: e.target.value })} placeholder="e.g. Tablet, Syrup" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Manufacturer</label>
            <input className={inputClass} value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="Manufacturer name" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Medicine description..." />
          </div>
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
        title="Delete Medicine"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
