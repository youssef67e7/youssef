import { useEffect, useState } from 'react';
import { medicinesAPI } from '../services/api';
import { Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await medicinesAPI.list({ search: search || undefined, limit: 50 });
      setMedicines(res.data?.data || res.data?.medicines || []);
    } catch { toast.error('Failed to load medicines'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await medicinesAPI.create({ ...form, price: Number(form.price), stock: Number(form.stock) });
      toast.success('Medicine added'); setShowAdd(false); setForm({ name: '', price: '', stock: '', category: '' }); load();
    } catch { toast.error('Failed to add'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await medicinesAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search medicines..." />
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold mb-3">Add Medicine</h2>
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name" className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px]" />
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="Price" type="number" className="px-3 py-2 border rounded-lg text-sm w-32" />
            <input value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required placeholder="Stock" type="number" className="px-3 py-2 border rounded-lg text-sm w-32" />
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category ID" className="px-3 py-2 border rounded-lg text-sm w-48" />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Stock</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              medicines.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No medicines</td></tr> :
                medicines.map(m => (
                  <tr key={m._id || m.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{m.name}</td>
                    <td className="px-5 py-3">${m.price}</td>
                    <td className="px-5 py-3">{m.stock}</td>
                    <td className="px-5 py-3 text-gray-500">{m.category?.name || m.category || '—'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(m._id || m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
