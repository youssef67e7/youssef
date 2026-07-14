import { useEffect, useState } from 'react';
import { suppliersAPI } from '../services/api';
import { Plus, Trash2, Edit2, Search, X, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', address: '', contactPerson: '', notes: '', isActive: true };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
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
      const res = await suppliersAPI.list({ search: search || undefined, limit: perPage, page: p });
      const d = res.data?.data || res.data;
      const list = Array.isArray(d?.suppliers || d) ? (d.suppliers || d) : [];
      setSuppliers(list);
      setTotalPages(d?.totalPages || 1);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s) => { setEditingId(s._id || s.id); setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', address: s.address || '', contactPerson: s.contactPerson || '', notes: s.notes || '', isActive: s.isActive !== false }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await suppliersAPI.update(editingId, form); toast.success('Updated'); }
      else { await suppliersAPI.create(form); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete supplier?')) return;
    try { await suppliersAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), load(1))} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search suppliers..." />
          </div>
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2><button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Company Name *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} placeholder="Contact Person" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes" className="px-3 py-2 border rounded-lg text-sm col-span-2" rows={2} />
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
            <tr><th className="px-5 py-3 font-medium">Company</th><th className="px-5 py-3 font-medium">Contact</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              suppliers.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No suppliers</td></tr> :
                suppliers.map(s => (
                  <tr key={s._id || s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.contactPerson || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${s.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{s.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button><button onClick={() => handleDelete(s._id || s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Prev</button>
          {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (<button key={p} onClick={() => { setPage(p); load(p); }} className={`px-3 py-1.5 border rounded text-sm ${p === page ? 'bg-primary-600 text-white' : ''}`}>{p}</button>))}
          <button disabled={page >= totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}