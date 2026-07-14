import { useEffect, useState } from 'react';
import { categoriesAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, GripVertical, Tags, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', nameAr: '', description: '', isActive: true });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [reordering, setReordering] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.list();
      const items = res.data?.data || res.data || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm({ name: '', nameAr: '', description: '', isActive: true }); setShowForm(true); };

  const openEdit = (c) => {
    setEditingId(c._id || c.id);
    setForm({ name: c.name || '', nameAr: c.nameAr || '', description: c.description || '', isActive: c.isActive !== false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, nameAr: form.nameAr || undefined, description: form.description || undefined, isActive: form.isActive };
      if (editingId) { await categoriesAPI.update(editingId, data); toast.success('Updated'); }
      else { await categoriesAPI.create(data); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm({ name: '', nameAr: '', description: '', isActive: true }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await categoriesAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const handleDragStart = (idx) => { setDragIdx(idx); };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const updated = [...categories];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setCategories(updated);
    setDragIdx(idx);
  };

  const handleDragEnd = async () => {
    setDragIdx(null);
    setReordering(true);
    try {
      const ids = categories.map(c => c._id || c.id);
      await categoriesAPI.reorder(ids);
      toast.success('Order saved');
    } catch { toast.error('Failed to save order'); }
    setReordering(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Categories" subtitle="Organize your medicine catalog"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Category
          </button>
        } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name (EN) *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="Name (AR)" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <label className="flex items-center gap-2 text-sm dark:text-gray-300"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-5 py-3 w-10 font-medium dark:text-gray-300"></th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Arabic Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Description</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400"><Tags size={32} className="mx-auto mb-2 opacity-50" />No categories found</td></tr>
              ) : categories.map((c, idx) => (
                <tr key={c._id || c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-move"
                  draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={handleDragEnd}>
                  <td className="px-5 py-3 text-gray-400"><GripVertical size={16} /></td>
                  <td className="px-5 py-3 font-medium dark:text-white">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{c.nameAr || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{c.description || '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.isActive !== false ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => { setDeleteId(c._id || c.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reordering && (
          <div className="p-2 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Saving order...
          </div>
        )}
      </div>

      <ConfirmDialog open={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Category" message="Are you sure you want to delete this category? This action cannot be undone." />
    </div>
  );
}
