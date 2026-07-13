import { useEffect, useState } from 'react';
import { offersAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Percent, Loader2, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { title: '', description: '', type: 'percentage', discount: '', startDate: '', endDate: '', isActive: true, products: [] };

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewScheduled, setViewScheduled] = useState(false);
  const [scheduledOffers, setScheduledOffers] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await offersAPI.list();
      setOffers(res.data?.data || []);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (o) => {
    setEditingId(o._id || o.id);
    setForm({
      title: o.title || o.name || '',
      description: o.description || '',
      type: o.type?.toLowerCase() || 'percentage',
      discount: o.discount?.toString() || o.discountValue?.toString() || '',
      startDate: o.startDate?.slice(0, 10) || '',
      endDate: o.endDate?.slice(0, 10) || '',
      isActive: o.isActive !== false,
      products: o.products || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        discount: Number(form.discount),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await offersAPI.update(editingId, data);
        toast.success('Updated');
      } else {
        await offersAPI.create(data);
        toast.success('Created');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await offersAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const handleToggleActive = async (o) => {
    try {
      await offersAPI.toggleActive(o._id || o.id);
      toast.success(o.isActive !== false ? 'Deactivated' : 'Activated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const loadScheduled = async () => {
    setViewScheduled(true);
    try {
      const res = await offersAPI.scheduled();
      const d = res.data?.data || res.data || [];
      setScheduledOffers(Array.isArray(d) ? d : []);
    } catch { toast.error('Failed to load scheduled offers'); }
  };

  const isScheduled = (o) => {
    if (!o.startDate || !o.endDate) return false;
    const now = new Date();
    return new Date(o.startDate) > now;
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Offers" subtitle="Manage promotional offers and discounts"
        actions={
          <>
            <button onClick={loadScheduled} className="flex items-center gap-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Calendar size={14} /> Scheduled
            </button>
            <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              <Plus size={16} /> Add Offer
            </button>
          </>
        } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Offer' : 'Add Offer'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Title *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ($)</option>
              <option value="buy_one_get_one">Buy One Get One</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <input value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} required placeholder="Discount *" type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} type="date" className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            </div>
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
                <th className="px-5 py-3 font-medium dark:text-gray-300">Title</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Type</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Discount</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Start Date</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">End Date</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Active</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Percent size={32} className="mx-auto mb-2 opacity-50" />No offers found</td></tr>
              ) : offers.map(o => (
                <tr key={o._id || o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">
                    {o.title || o.name}
                    {isScheduled(o) && <span className="ml-2 text-xs text-blue-500 font-normal">Scheduled</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 capitalize">{o.type?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-3 dark:text-gray-300">
                    {o.type === 'percentage' ? `${o.discount || o.discountValue}%` :
                     o.type === 'fixed' ? `$${o.discount || o.discountValue}` :
                     o.discount || o.discountValue || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{o.startDate ? new Date(o.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{o.endDate ? new Date(o.endDate).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.isActive !== false ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(o)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleToggleActive(o)} className={o.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} title={o.isActive !== false ? 'Deactivate' : 'Activate'}>
                        {o.isActive !== false ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                      <button onClick={() => { setDeleteId(o._id || o.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewScheduled && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Scheduled Offers</h3>
              <button onClick={() => { setViewScheduled(false); setScheduledOffers([]); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {scheduledOffers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No scheduled offers</p>
            ) : (
              <div className="space-y-3">
                {scheduledOffers.map(o => (
                  <div key={o._id || o.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white text-sm">{o.title || o.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {o.startDate ? new Date(o.startDate).toLocaleDateString() : '—'} — {o.endDate ? new Date(o.endDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <StatusBadge status={o.isActive !== false ? 'active' : 'inactive'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Offer" message="Are you sure you want to delete this offer? This action cannot be undone." />
    </div>
  );
}
