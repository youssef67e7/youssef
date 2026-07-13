import { useEffect, useState } from 'react';
import { couponsAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', name: '', discountValue: '', type: 'PERCENTAGE', startDate: '', endDate: '' });

  const load = async () => {
    setLoading(true);
    try { const res = await couponsAPI.list(); setCoupons(res.data?.data || []); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await couponsAPI.create({
        code: form.code,
        name: form.name,
        type: form.type,
        discountValue: Number(form.discountValue),
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success('Added');
      setForm({ code: '', name: '', discountValue: '', type: 'PERCENTAGE', startDate: '', endDate: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await couponsAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="Code *" className="px-4 py-2 border rounded-lg text-sm w-40" />
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name *" className="px-4 py-2 border rounded-lg text-sm w-40" />
        <input value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required placeholder="Discount *" type="number" className="px-4 py-2 border rounded-lg text-sm w-32" />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-2 border rounded-lg text-sm">
          <option value="PERCENTAGE">%</option><option value="FIXED">$</option><option value="FREE_SHIPPING">Free Ship</option>
        </select>
        <input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} type="date" className="px-4 py-2 border rounded-lg text-sm" />
        <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" className="px-4 py-2 border rounded-lg text-sm" />
        <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Code</th><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Discount</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Valid</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              coupons.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No coupons</td></tr> :
                coupons.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-5 py-3">{c.name}</td>
                    <td className="px-5 py-3">{c.discountValue}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-gray-100">{c.type}</span></td>
                    <td className="px-5 py-3 text-xs text-gray-500">{c.startDate?.slice(0,10)} → {c.endDate?.slice(0,10)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(c._id || c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
