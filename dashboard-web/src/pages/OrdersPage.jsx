import { useEffect, useState } from 'react';
import { ordersAPI, driversAPI } from '../services/api';
import { Search, Filter, Eye, Truck, Calendar, Loader2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_METHODS = ['cash_on_delivery', 'credit_card', 'debit_card', 'online'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: p };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [ordersRes, driversRes] = await Promise.allSettled([
        ordersAPI.list(params),
        driversAPI.list({ limit: 100 }),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data;
        setOrders(d?.data || d?.orders || []);
        setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / 20) || 1);
      }
      if (driversRes.status === 'fulfilled') {
        const d = driversRes.value.data?.data || driversRes.value.data || [];
        setDrivers(Array.isArray(d) ? d : d?.drivers || []);
      }
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await ordersAPI.updateStatus(id, status); toast.success('Status updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return toast.error('Select a driver');
    try {
      await ordersAPI.assignDriver(assignOrderId, selectedDriver);
      toast.success('Driver assigned'); setShowAssign(false); setAssignOrderId(null); setSelectedDriver(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewInvoice = async (id) => {
    try {
      const res = await ordersAPI.getInvoice(id);
      setInvoiceData(res.data?.data || res.data);
      setShowInvoice(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to load invoice'); }
  };

  const paymentLabel = (m) => {
    if (!m) return '—';
    const labels = { cash_on_delivery: 'Cash on Delivery', credit_card: 'Credit Card', debit_card: 'Debit Card', online: 'Online' };
    return labels[m] || m;
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Orders" subtitle="Manage customer orders" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(1), load(1))}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="Search orders..." />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <span className="text-gray-400">—</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
          </div>
          <button onClick={() => load(1)} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Filter</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Order #</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Customer</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Items</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Total</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Payment</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Date</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400"><ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o._id || o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium dark:text-white">{o.orderNumber || o._id?.slice(-8) || '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{o.customer?.name || o.user?.name || '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{o.items?.length || o.itemCount || 0}</td>
                  <td className="px-4 py-3 font-medium dark:text-white">${o.totalAmount || o.total || 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{paymentLabel(o.paymentMethod)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select value={o.status} onChange={e => handleStatus(o._id || o.id, e.target.value)}
                        className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 text-xs">
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      <button onClick={() => { setAssignOrderId(o._id || o.id); setShowAssign(true); }}
                        className="text-purple-500 hover:text-purple-700" title="Assign Driver">
                        <Truck size={16} />
                      </button>
                      <button onClick={() => viewInvoice(o._id || o.id)}
                        className="text-blue-500 hover:text-blue-700" title="View Invoice">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }}
            className="px-3 py-1.5 border dark:border-gray-600 rounded text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); load(p); }}
              className={`px-3 py-1.5 border rounded text-sm ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }}
            className="px-3 py-1.5 border dark:border-gray-600 rounded text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Assign Driver</h3>
              <button onClick={() => { setShowAssign(false); setAssignOrderId(null); setSelectedDriver(''); }} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm mb-4">
              <option value="">Select a driver</option>
              {drivers.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name} ({d.phone || d.email})</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAssign(false); setAssignOrderId(null); setSelectedDriver(''); }}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleAssignDriver} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Assign</button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Invoice</h3>
              <button onClick={() => { setShowInvoice(false); setInvoiceData(null); }} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <pre className="text-sm dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              {JSON.stringify(invoiceData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
