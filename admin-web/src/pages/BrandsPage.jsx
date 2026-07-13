import { useEffect, useState } from 'react';
import { brandsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', nameAr: '', description: '', logo: '', isActive: true });

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

  const openAdd = () => { setEditingId(null); setForm({ name: '', nameAr: '', description: '', logo: '', isActive: true }); setShowForm(true); };
  const openEdit = (b) => { setEditingId(b._id || b.id); setForm({ name: b.name || '', nameAr: b.nameAr || '', description: b.description || '', logo: b.logo || '', isActive: b.isActive !== false }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, nameAr: form.nameAr || undefined, description: form.description || undefined, logo: form.logo || undefined, isActive: form.isActive };
      if (editingId) { await brandsAPI.update(editingId, data); toast.success('Updated'); }
      else { await brandsAPI.create(data); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm({ name: '', nameAr: '', description: '', logo: '', isActive: true }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await brandsAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands</h1>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name (EN) *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="Name (AR)" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} placeholder="Logo URL" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Arabic</th><th className="px-5 py-3 font-medium">Description</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              brands.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No brands</td></tr> :
                brands.map(b => (
                  <tr key={b._id || b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{b.name} {b.nameAr && <span className="text-gray-400 text-xs">({b.nameAr})</span>}</td>
                    <td className="px-5 py-3 text-gray-500">{b.nameAr || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{b.description || '—'}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${b.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{b.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(b._id || b.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
