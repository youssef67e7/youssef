import { useEffect, useState } from 'react';
import { inventoryAPI, medicinesAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, History } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { medicine: '', quantity: '', type: 'INCOMING', notes: '', reference: '' };

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [movements, setMovements] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invRes, medRes] = await Promise.allSettled([
        lowStockFilter ? inventoryAPI.lowStock() : inventoryAPI.list({ search: search || undefined }),
        medicinesAPI.list({ limit: 100 }),
      ]);
      if (invRes.status === 'fulfilled') { const d = invRes.value.data; setItems(d?.data || d?.inventory || []); }
      if (medRes.status === 'fulfilled') { const d = medRes.value.data?.data || []; setMedicines(Array.isArray(d) ? d : []); }
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [lowStockFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.create({ medicine: form.medicine, quantity: Number(form.quantity), type: form.type, notes: form.notes || undefined, reference: form.reference || undefined });
      toast.success('Stock updated'); setShowForm(false); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inventory record?')) return;
    try { await inventoryAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const showMovements = async (id) => {
    try { const res = await inventoryAPI.stockMovements(id); setMovements(res.data?.data || []); }
    catch { toast.error('Failed to load'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLowStockFilter(!lowStockFilter); }} className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm ${lowStockFilter ? 'bg-red-50 border-red-300 text-red-700' : ''}`}>
            <AlertTriangle size={16} /> {lowStockFilter ? 'Show All' : 'Low Stock'}
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search inventory..." />
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add Stock</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">Add Stock Movement</h2><button onClick={() => setShowForm(false)}><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.medicine} onChange={e => setForm({...form, medicine: e.target.value})} required className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Select Medicine *</option>
              {medicines.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.sku})</option>)}
            </select>
            <input value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required placeholder="Quantity *" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="INCOMING">Incoming (+)</option><option value="OUTGOING">Outgoing (-)</option><option value="ADJUSTMENT">Adjustment</option><option value="RETURN">Return</option><option value="DAMAGED">Damaged</option>
            </select>
            <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} placeholder="Reference #" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-4 py-3 font-medium">Medicine</th><th className="px-4 py-3 font-medium">SKU</th><th className="px-4 py-3 font-medium">Current Stock</th><th className="px-4 py-3 font-medium">Last Movement</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              items.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No inventory records</td></tr> :
                items.map(i => (
                  <tr key={i._id || i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{i.medicine?.name || i.medicineName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{i.medicine?.sku || i.sku || '—'}</td>
                    <td className="px-4 py-3"><span className={`font-medium ${(i.stockQuantity ?? i.quantity ?? 0) <= 5 ? 'text-red-600' : 'text-green-600'}`}>{i.stockQuantity ?? i.quantity ?? 0}</span></td>
                    <td className="px-4 py-3 text-gray-500">{i.lastMovement ? new Date(i.lastMovement).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${i.type === 'INCOMING' ? 'bg-green-50 text-green-700' : i.type === 'OUTGOING' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>{i.type || '—'}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => showMovements(i._id || i.id)} className="text-blue-500 hover:text-blue-700 mr-2"><History size={16} /></button>
                      <button onClick={() => handleDelete(i._id || i.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {movements && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setMovements(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Stock Movement History</h3><button onClick={() => setMovements(null)}><X size={18} /></button></div>
            {movements.length === 0 ? <p className="text-gray-400 text-center py-4">No movements recorded</p> :
              <div className="space-y-3">
                {movements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${m.type === 'INCOMING' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.type}</span>
                      <span className="ml-2 text-sm text-gray-600">{m.quantity} units</span>
                      {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}