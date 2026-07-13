import { useEffect, useState } from 'react';
import { medicinesAPI, categoriesAPI, brandsAPI } from '../services/api';
import { Plus, Trash2, Search, Edit2, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const DOSAGE_FORMS = ['TABLET','CAPSULE','LIQUID','SYRUP','SUSPENSION','INJECTION','DROPS','CREAM','OINTMENT','GEL','SUPPOSITORY','INHALER','PATCH','POWDER','SPRAY','SOLUTION','EYE_DROPS','EAR_DROPS','NASAL_SPRAY','TOPICAL'];
const emptyForm = { name: '', nameAr: '', price: '', stockQuantity: '', category: '', sku: '', dosageForm: 'TABLET', strength: '', description: '', brand: '', isActive: true };

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [medRes, catRes, brandRes] = await Promise.allSettled([
        medicinesAPI.list({ search: search || undefined, limit: perPage, page: p }),
        categoriesAPI.list(),
        brandsAPI.list(),
      ]);
      if (medRes.status === 'fulfilled') {
        const d = medRes.value.data;
        setMedicines(d?.data || d?.medicines || []);
        setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / perPage) || 1);
      }
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.data || catRes.value.data || [];
        setCategories(Array.isArray(d) ? d : []);
      }
      if (brandRes.status === 'fulfilled') {
        const d = brandRes.value.data?.data || brandRes.value.data || [];
        setBrands(Array.isArray(d) ? d : []);
      }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditingId(m._id || m.id);
    setForm({
      name: m.name || '',
      nameAr: m.nameAr || '',
      price: m.price?.toString() || '',
      stockQuantity: m.stockQuantity?.toString() || m.stock?.toString() || '',
      category: m.category?._id || m.category || '',
      sku: m.sku || '',
      dosageForm: m.dosageForm || 'TABLET',
      strength: m.strength || '',
      description: m.description || '',
      brand: m.brand?._id || m.brand || '',
      isActive: m.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name, nameAr: form.nameAr || undefined,
        price: Number(form.price), stockQuantity: Number(form.stockQuantity),
        category: form.category, sku: form.sku,
        dosageForm: form.dosageForm, strength: form.strength,
        description: form.description, brand: form.brand || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await medicinesAPI.update(editingId, data);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(data);
        toast.success('Medicine added');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
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
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), load(1))}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search medicines..." />
          </div>
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name (EN) *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="Name (AR)" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="Price *" type="number" step="0.01" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} required placeholder="Stock *" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required placeholder="SKU *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.strength} onChange={e => setForm({...form, strength: e.target.value})} required placeholder="Strength * (e.g. 500mg)" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.dosageForm} onChange={e => setForm({...form, dosageForm: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Select Category *</option>
              {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
            <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">SKU</th><th className="px-4 py-3 font-medium">Form</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              medicines.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No medicines</td></tr> :
                medicines.map(m => (
                  <tr key={m._id || m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.name} {m.nameAr && <span className="text-gray-400 text-xs">({m.nameAr})</span>}</td>
                    <td className="px-4 py-3">${m.price}</td>
                    <td className="px-4 py-3"><span className={m.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>{m.stockQuantity ?? m.stock ?? 0}</span></td>
                    <td className="px-4 py-3 text-gray-500">{m.sku || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.dosageForm || '—'}</td>
                    <td className="px-4 py-3">{m.category?.name || m.category || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(m._id || m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Prev</button>
          {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); load(p); }} className={`px-3 py-1.5 border rounded text-sm ${p === page ? 'bg-primary-600 text-white' : ''}`}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
