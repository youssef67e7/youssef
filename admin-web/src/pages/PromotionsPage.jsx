import { useEffect, useState } from 'react';
import { promotionsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Search, Percent, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', discountType: 'PERCENTAGE', discountValue: '', startDate: '', endDate: '', isActive: true };

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try { const res = await promotionsAPI.list(); setPromotions(res.data?.data || []); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p) => {
    setEditingId(p._id || p.id);
    setForm({ title: p.title || '', description: p.description || '', discountType: p.discountType || 'PERCENTAGE', discountValue: p.discountValue?.toString() || '', startDate: p.startDate?.slice(0,10) || '', endDate: p.endDate?.slice(0,10) || '', isActive: p.isActive !== false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { title: form.title, description: form.description || undefined, discountType: form.discountType, discountValue: Number(form.discountValue), startDate: form.startDate || new Date().toISOString(), endDate: form.endDate || undefined, isActive: form.isActive };
      if (editingId) { await promotionsAPI.update(editingId, data); toast.success('Updated'); }
      else { await promotionsAPI.create(data); toast.success('Created'); }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete promotion?')) return;
    try { await promotionsAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search promotions..." />
          </div>
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">{editingId ? 'Edit Promotion' : 'Add Promotion'}</h2><button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Title *" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option><option value="BUY_ONE_GET_ONE">BOGO</option>
            </select>
            <input value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required placeholder="Discount Value *" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} type="date" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border rounded-lg text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({length: 6}).map((_, i) => <div key={i} className="bg-white rounded-xl shadow-sm border p-5 animate-pulse"><div className="h-5 bg-gray-200 rounded w-3/4 mb-3" /><div className="h-4 bg-gray-100 rounded w-1/2 mb-2" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div>) :
          promotions.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400">No promotions</div> :
            promotions.map(p => (
              <div key={p._id || p.id} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><Percent size={20} className="text-primary-600" /></div>
                    <div><h3 className="font-semibold">{p.title}</h3><p className="text-xs text-gray-400">{p.discountType}</p></div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${p.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{p.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
                {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.startDate?.slice(0,10) || 'Start'} - {p.endDate?.slice(0,10) || 'End'}</span>
                  <span className="font-medium text-primary-600">{p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `$${p.discountValue}`} OFF</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                  <button onClick={() => handleDelete(p._id || p.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}