import { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.list({ limit: 50 });
      setOrders(res.data?.data || res.data?.orders || []);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await ordersAPI.updateStatus(id, status); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Order #</th><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Total</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              orders.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No orders</td></tr> :
                orders.map(o => (
                  <tr key={o._id || o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{o.orderNumber || o._id?.slice(-8)}</td>
                    <td className="px-5 py-3 text-gray-500">{o.user?.name || o.customer?.name || '—'}</td>
                    <td className="px-5 py-3 font-medium">${o.totalAmount || o.total}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[o.status] || 'bg-gray-50 text-gray-700'}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <select value={o.status} onChange={e => handleStatus(o._id || o.id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs">
                        {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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
