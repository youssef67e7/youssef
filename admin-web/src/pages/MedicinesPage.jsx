import { useEffect, useState } from 'react';
import { medicinesAPI } from '../services/api';
import { Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DOSAGE_FORMS = ['TABLET','CAPSULE','LIQUID','SYRUP','SUSPENSION','INJECTION','DROPS','CREAM','OINTMENT','GEL','SUPPOSITORY','INHALER','PATCH','POWDER','SPRAY','SOLUTION','EYE_DROPS','EAR_DROPS','NASAL_SPRAY','TOPICAL'];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stockQuantity: '', category: '', sku: '', dosageForm: 'TABLET', strength: '', description: '', brand: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await medicinesAPI.list({ search: search || undefined, limit: 50 });
      const items = res.data?.data || [];
      setMedicines(Array.isArray(items) ? items : items.medicines || []);
    } catch { toast.error('Failed to load medicines'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await medicinesAPI.create({
        name: form.name,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        category: form.category,
        sku: form.sku,
        dosageForm: form.dosageForm,
        strength: form.strength,
        description: form.description,
        brand: form.brand || undefined,
      });
      toast.success('Medicine added'); setShowAdd(false);
      setForm({ name: '', price: '', stockQuantity: '', category: '', sku: '', dosageForm: 'TABLET', strength: '', description: '', brand: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await medicinesAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
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
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="Price *" type="number" step="0.01" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} required placeholder="Stock *" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required placeholder="SKU *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.strength} onChange={e => setForm({...form, strength: e.target.value})} required placeholder="Strength * (e.g. 500mg)" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.dosageForm} onChange={e => setForm({...form, dosageForm: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} required placeholder="Category ID *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Brand ID" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">SKU</th><th className="px-4 py-3 font-medium">Form</th><th className="px-4 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              medicines.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No medicines</td></tr> :
                medicines.map(m => (
                  <tr key={m._id || m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3">${m.price}</td>
                    <td className="px-4 py-3">{m.stockQuantity ?? m.stock ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{m.sku || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.dosageForm || '—'}</td>
                    <td className="px-4 py-3">
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
