import { useEffect, useState } from 'react';
import { couponsAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage' });

  const load = async () => {
    setLoading(true);
    try { const res = await couponsAPI.list(); setCoupons(res.data?.data || res.data || []); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await couponsAPI.create({ ...form, discount: Number(form.discount) }); toast.success('Added'); setForm({ code: '', discount: '', type: 'percentage' }); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await couponsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="Code" className="px-4 py-2 border rounded-lg text-sm w-40" />
        <input value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} required placeholder="Discount" type="number" className="px-4 py-2 border rounded-lg text-sm w-32" />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-2 border rounded-lg text-sm">
          <option value="percentage">%</option><option value="fixed">$</option>
        </select>
        <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Code</th><th className="px-5 py-3 font-medium">Discount</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              coupons.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-gray-400">No coupons</td></tr> :
                coupons.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-5 py-3">{c.discount}{c.type === 'percentage' ? '%' : '$'}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-gray-100">{c.type}</span></td>
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
