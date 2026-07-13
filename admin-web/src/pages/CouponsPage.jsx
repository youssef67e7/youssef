import { useEffect, useState } from 'react';
import { couponsAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { code: '', name: '', discountValue: '', minOrder: '', maxUses: '', type: 'PERCENTAGE', startDate: '', endDate: '', isActive: true };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try { const res = await couponsAPI.list(); setCoupons(res.data?.data || []); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c) => {
    setEditingId(c._id || c.id);
    setForm({
      code: c.code || '', name: c.name || '', discountValue: c.discountValue?.toString() || '',
      minOrder: c.minOrder?.toString() || '', maxUses: c.maxUses?.toString() || '',
      type: c.type || 'PERCENTAGE', startDate: c.startDate?.slice(0,10) || '',
      endDate: c.endDate?.slice(0,10) || '', isActive: c.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        code: form.code, name: form.name, type: form.type,
        discountValue: Number(form.discountValue),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: form.isActive,
      };
      if (editingId) { await couponsAPI.update(editingId, data); toast.success('Updated'); }
      else { await couponsAPI.create(data); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await couponsAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleActive = async (c) => {
    try { await couponsAPI.update(c._id || c.id, { isActive: !c.isActive }); toast.success(c.isActive ? 'Deactivated' : 'Activated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="Code *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required placeholder="Discount *" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option><option value="FREE_SHIPPING">Free Shipping</option>
            </select>
            <input value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} placeholder="Min Order" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Max Uses" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} type="date" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" className="px-3 py-2 border rounded-lg text-sm" />
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
            <tr><th className="px-5 py-3 font-medium">Code</th><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Discount</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Valid</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              coupons.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No coupons</td></tr> :
                coupons.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-5 py-3">{c.name}</td>
                    <td className="px-5 py-3">{c.type === 'PERCENTAGE' ? `${c.discountValue}%` : c.type === 'FIXED' ? `$${c.discountValue}` : c.discountValue}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-gray-100">{c.type}</span></td>
                    <td className="px-5 py-3 text-xs text-gray-500">{c.startDate?.slice(0,10)} → {c.endDate?.slice(0,10)}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${c.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{c.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleToggleActive(c)} className={c.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}>{c.isActive !== false ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}</button>
                        <button onClick={() => handleDelete(c._id || c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
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
