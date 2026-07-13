import { useEffect, useState } from 'react';
import { deliveryAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  assigned: 'bg-blue-50 text-blue-700',
  picked_up: 'bg-indigo-50 text-indigo-700',
  in_transit: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await deliveryAPI.list({ limit: 50 }); setDeliveries(res.data?.data || res.data?.deliveries || []); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await deliveryAPI.updateStatus(id, status); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Delivery</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">ID</th><th className="px-5 py-3 font-medium">Driver</th><th className="px-5 py-3 font-medium">Order</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              deliveries.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No deliveries</td></tr> :
                deliveries.map(d => (
                  <tr key={d._id || d.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">{(d._id || d.id)?.slice(-8)}</td>
                    <td className="px-5 py-3">{d.driver?.name || '—'}</td>
                    <td className="px-5 py-3">{d.order?.orderNumber || '—'}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[d.status] || 'bg-gray-50 text-gray-700'}`}>{d.status}</span></td>
                    <td className="px-5 py-3">
                      <select value={d.status} onChange={e => handleStatus(d._id || d.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                        {['pending','assigned','picked_up','in_transit','delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
