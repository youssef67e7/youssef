import { useEffect, useState } from 'react';
import { suppliersAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Truck, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await suppliersAPI.list({ page: p, limit: 15, search: search || undefined });
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.suppliers || raw?.data || []);
      setSuppliers(Array.isArray(list) ? list : []);
      setTotalPages(raw?.totalPages || raw?.pages || 1);
    } catch { toast.error('Failed to load suppliers'); }
    setLoading(false);
  };

  useEffect(() => { load(1); setPage(1); }, [search]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (s) => {
    setEditingId(s._id || s.id);
    setForm({ name: s.name || '', contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '', address: s.address || '', notes: s.notes || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, contactPerson: form.contactPerson, email: form.email, phone: form.phone, address: form.address, notes: form.notes };
      if (editingId) {
        await suppliersAPI.update(editingId, data);
        toast.success('Updated');
      } else {
        await suppliersAPI.create(data);
        toast.success('Created');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await suppliersAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const goPage = (p) => { setPage(p); load(p); };

  return (
    <div className="space-y-4">
      <PageHeader title="Suppliers" subtitle="Manage suppliers"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Supplier
          </button>
        } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..."
            className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Company Name *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} required placeholder="Contact Person *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <div className="flex gap-2 col-span-2">
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
                <th className="px-5 py-3 font-medium dark:text-gray-300">Company Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Contact Person</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Email</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Phone</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400"><Truck size={32} className="mx-auto mb-2 opacity-50" />No suppliers found</td></tr>
              ) : suppliers.map(s => (
                <tr key={s._id || s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{s.name}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{s.contactPerson || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{s.email || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{s.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.isActive !== false ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => { setDeleteId(s._id || s.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog open={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Supplier" message="Are you sure you want to delete this supplier? This action cannot be undone." />
    </div>
  );
}
