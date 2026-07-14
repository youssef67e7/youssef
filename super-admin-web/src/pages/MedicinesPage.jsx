import { useEffect, useState, useCallback } from 'react';
import { medicinesAPI } from '../services/api';
import {
  Pill, Eye, Plus, Edit3, Trash2,
  DollarSign, Package, Tag, AlertTriangle, TrendingUp
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const categoryOptions = [
  'All Categories', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Allergy',
  'Cardiovascular', 'Diabetes', 'Digestive', 'Respiratory', 'Skin Care'
];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '', description: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const load = useCallback(async (p = page, s = search, c = categoryFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      if (c !== 'All Categories') params.category = c;
      const res = await medicinesAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setMedicines(data);
        setTotalPages(Math.ceil(data.length / 10) || 1);
        setTotal(data.length);
      } else {
        setMedicines(Array.isArray(data?.medicines) ? data.medicines : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      }
    } catch {
      toast.error('Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => { setSearch(val); setPage(1); load(1, val, categoryFilter); };
  const handleCategoryFilter = (c) => { setCategoryFilter(c); setPage(1); load(1, search, c); };

  const openCreate = () => { setForm({ name: '', price: '', stock: '', category: '', description: '' }); setShowForm(true); };
  const openEdit = (med) => { setForm({ name: med.name || '', price: String(med.price || ''), stock: String(med.stockQuantity || med.stock || ''), category: med.category || '', description: med.description || '' }); setEditTarget(med); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSubmitLoading(true);
    try {
      const payload = { name: form.name, price: parseFloat(form.price) || 0, stockQuantity: parseInt(form.stock) || 0, category: form.category, description: form.description };
      if (editTarget) {
        await medicinesAPI.update(editTarget._id || editTarget.id, payload);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(payload);
        toast.success('Medicine created');
      }
      setShowForm(false); setEditTarget(null);
      load();
    } catch {
      toast.error(editTarget ? 'Failed to update' : 'Failed to create');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await medicinesAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Medicine deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Medicine', sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <Pill size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.category || 'Uncategorized'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price', label: 'Price', sortable: true,
      render: (val) => <span className="font-semibold dark:text-white">${(val || 0).toFixed(2)}</span>,
    },
    {
      key: 'stockQuantity', label: 'Stock', sortable: true,
      render: (val, row) => {
        const stock = val || row.stock || 0;
        const isLow = stock < 10;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isLow ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
            {isLow && <AlertTriangle size={12} />}
            {stock}
          </span>
        );
      },
    },
    {
      key: 'category', label: 'Category',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-blue-500" title="Edit">
            <Edit3 size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-red-500" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicines"
        subtitle={`${total} medicines in catalog`}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Add Medicine
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {categoryOptions.map((c) => (
          <button
            key={c}
            onClick={() => handleCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              categoryFilter === c
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={medicines}
        loading={loading}
        emptyIcon={Pill}
        emptyTitle="No medicines found"
        emptyDescription="No medicines match your current filters."
        searchPlaceholder="Search by name..."
        onSearch={handleSearch}
        pagination={{ page, totalPages, total, onPageChange: (p) => { setPage(p); load(p, search, categoryFilter); } }}
      />

      <Modal open={showForm || !!editTarget} onClose={() => { setShowForm(false); setEditTarget(null); }} title={editTarget ? 'Edit Medicine' : 'Add New Medicine'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
              <option value="">Select category</option>
              {categoryOptions.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setEditTarget(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={submitLoading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">{submitLoading ? 'Saving...' : editTarget ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Medicine" confirmText="Delete" confirmVariant="danger" message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  );
}
