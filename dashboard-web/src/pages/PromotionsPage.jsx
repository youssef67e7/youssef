import { useEffect, useState } from 'react';
import { promotionsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Percent, Loader2, Search, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPES = ['PERCENTAGE', 'FIXED', 'BOGO', 'FREE_SHIPPING'];
const emptyForm = { title: '', description: '', type: 'PERCENTAGE', value: '', startDate: '', endDate: '', minimumOrderAmount: '', maxUses: '' };

const typeBadge = (type) => {
  const colors = {
    PERCENTAGE: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
    FIXED: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    BOGO: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
    FREE_SHIPPING: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[type] || colors.PERCENTAGE}`}>{type}</span>;
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
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
      const res = await promotionsAPI.list({ page: p, limit: 15, search: search || undefined });
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.promotions || raw?.data || []);
      setPromotions(Array.isArray(list) ? list : []);
      setTotalPages(raw?.totalPages || raw?.pages || 1);
    } catch { toast.error('Failed to load promotions'); }
    setLoading(false);
  };

  useEffect(() => { load(1); setPage(1); }, [search]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (p) => {
    setEditingId(p._id || p.id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      type: p.type || 'PERCENTAGE',
      value: p.value || '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      minimumOrderAmount: p.minimumOrderAmount || '',
      maxUses: p.maxUses || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: form.title,
        description: form.description,
        type: form.type,
        value: form.value ? Number(form.value) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      };
      if (editingId) {
        await promotionsAPI.update(editingId, data);
        toast.success('Updated');
      } else {
        await promotionsAPI.create(data);
        toast.success('Created');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await promotionsAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const toggleActive = async (p) => {
    try {
      await promotionsAPI.toggleActive(p._id || p.id);
      toast.success(p.isActive !== false ? 'Deactivated' : 'Activated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const goPage = (p) => { setPage(p); load(p); };

  return (
    <div className="space-y-4">
      <PageHeader title="Promotions" subtitle="Manage promotions and discounts"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Promotion
          </button>
        } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search promotions..."
            className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Promotion' : 'Add Promotion'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Title *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <input value={form.value} onChange={e => setForm({...form, value: e.target.value})} required placeholder="Value *" type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required placeholder="Start Date *" type="date" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required placeholder="End Date *" type="date" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.minimumOrderAmount} onChange={e => setForm({...form, minimumOrderAmount: e.target.value})} placeholder="Min Order Amount" type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Max Uses" type="number" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
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
                <th className="px-5 py-3 font-medium dark:text-gray-300">Title</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Type</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Value</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Start Date</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">End Date</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Tag size={32} className="mx-auto mb-2 opacity-50" />No promotions found</td></tr>
              ) : promotions.map(p => (
                <tr key={p._id || p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{p.title}</td>
                  <td className="px-5 py-3">{typeBadge(p.type)}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.value}{p.type === 'PERCENTAGE' ? '%' : ''}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.isActive !== false ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(p)} className={p.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} title={p.isActive !== false ? 'Deactivate' : 'Activate'}>
                        {p.isActive !== false ? '🔴' : '🟢'}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => { setDeleteId(p._id || p.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
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
        onConfirm={handleDelete} title="Delete Promotion" message="Are you sure you want to delete this promotion? This action cannot be undone." />
    </div>
  );
}
