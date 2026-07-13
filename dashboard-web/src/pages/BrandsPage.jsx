import { useEffect, useState } from 'react';
import { brandsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Award, Loader2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', logo: '', isActive: true });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await brandsAPI.list();
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setBrands(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm({ name: '', description: '', logo: '', isActive: true }); setShowForm(true); };

  const openEdit = (b) => {
    setEditingId(b._id || b.id);
    setForm({ name: b.name || '', description: b.description || '', logo: b.logo || '', isActive: b.isActive !== false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, description: form.description || undefined, logo: form.logo || undefined, isActive: form.isActive };
      if (editingId) { await brandsAPI.update(editingId, data); toast.success('Updated'); }
      else { await brandsAPI.create(data); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm({ name: '', description: '', logo: '', isActive: true }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await brandsAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Brands" subtitle="Manage medicine brands"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Brand
          </button>
        } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} placeholder="Logo URL" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
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
                <th className="px-5 py-3 font-medium dark:text-gray-300">Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Description</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Image</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400"><Award size={32} className="mx-auto mb-2 opacity-50" />No brands found</td></tr>
              ) : brands.map(b => (
                <tr key={b._id || b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{b.name}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{b.description || '—'}</td>
                  <td className="px-5 py-3">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <Image size={16} className="text-gray-300" />
                    )}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={b.isActive !== false ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => { setDeleteId(b._id || b.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Brand" message="Are you sure you want to delete this brand? This action cannot be undone." />
    </div>
  );
}
