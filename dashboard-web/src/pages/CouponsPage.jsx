import { useEffect, useState } from 'react';
import { couponsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Ticket, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { code: '', type: 'percentage', value: '', minOrderAmount: '', maxUses: '', expiryDate: '', isActive: true };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await couponsAPI.list();
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.coupons || raw?.data || []);
      setCoupons(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (c) => {
    setEditingId(c._id || c.id);
    setForm({
      code: c.code || '',
      type: c.type?.toLowerCase() || 'percentage',
      value: c.value?.toString() || c.discountValue?.toString() || '',
      minOrderAmount: c.minOrderAmount?.toString() || c.minOrder?.toString() || '',
      maxUses: c.maxUses?.toString() || '',
      expiryDate: c.expiryDate?.slice(0, 10) || c.endDate?.slice(0, 10) || '',
      isActive: c.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiryDate: form.expiryDate || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await couponsAPI.update(editingId, data);
        toast.success('Updated');
      } else {
        await couponsAPI.create(data);
        toast.success('Created');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await couponsAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const handleToggleActive = async (c) => {
    try {
      await couponsAPI.toggleActive(c._id || c.id);
      toast.success(c.isActive !== false ? 'Deactivated' : 'Activated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Coupons" subtitle="Manage discount coupons"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Coupon
          </button>
        } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required placeholder="Code *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm font-mono uppercase" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
            <input value={form.value} onChange={e => setForm({...form, value: e.target.value})} required placeholder={form.type === 'percentage' ? 'Discount % *' : 'Discount Amount *'} type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="Min Order Amount" type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Max Uses" type="number" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} type="date" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
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
                <th className="px-5 py-3 font-medium dark:text-gray-300">Code</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Type</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Value</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Min Order</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Max Uses</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Used</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Active</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400"><Ticket size={32} className="mx-auto mb-2 opacity-50" />No coupons found</td></tr>
              ) : coupons.map(c => (
                <tr key={c._id || c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-mono font-medium dark:text-white">{c.code}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 capitalize">{c.type}</span>
                  </td>
                  <td className="px-5 py-3 dark:text-gray-300">{c.type === 'percentage' ? `${c.value || c.discountValue}%` : `$${c.value || c.discountValue}`}</td>
                  <td className="px-5 py-3 dark:text-gray-300">{c.minOrderAmount || c.minOrder ? `$${c.minOrderAmount || c.minOrder}` : '—'}</td>
                  <td className="px-5 py-3 dark:text-gray-300">{c.maxUses ?? '∞'}</td>
                  <td className="px-5 py-3 dark:text-gray-300">{c.usedCount ?? c.timesUsed ?? 0}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.isActive !== false ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleToggleActive(c)} className={c.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} title={c.isActive !== false ? 'Deactivate' : 'Activate'}>
                        {c.isActive !== false ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                      <button onClick={() => { setDeleteId(c._id || c.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Coupon" message="Are you sure you want to delete this coupon? This action cannot be undone." />
    </div>
  );
}
