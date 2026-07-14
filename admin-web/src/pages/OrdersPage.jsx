import { useState, useEffect, useCallback } from 'react';
import { Eye, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { ordersAPI } from '../services/api';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-blue-50 text-blue-600',
  processing: 'bg-indigo-50 text-indigo-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await ordersAPI.list(params);
      const d = data.data || data;
      const raw = d.orders || d.items || d || [];
      setOrders(Array.isArray(raw) ? raw : []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const viewDetail = async (order) => {
    setDetailLoading(true);
    setDetailOrder(order);
    try {
      const { data } = await ordersAPI.get(order._id || order.id);
      setDetailOrder(data.data || data);
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => <span className="font-medium text-gray-900">#{v || row._id?.slice(-8)}</span> },
    { key: 'customer', label: 'Customer', render: (v) => v?.name || v?.email || '—' },
    { key: 'totalAmount', label: 'Total', render: (v) => `$${Number(v || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v, row) => (
      <select
        value={v || 'pending'}
        onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-primary-300 cursor-pointer ${STATUS_STYLES[v] || 'bg-gray-50 text-gray-600'}`}
      >
        {STATUS_OPTIONS.filter((s) => s !== 'all').map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    )},
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: 'Actions', width: '80px', render: (_, row) => (
      <button onClick={() => viewDetail(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
        <Eye size={16} />
      </button>
    )},
  ];

  const items = detailOrder?.items || detailOrder?.orderItems || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here when customers place them"
        searchPlaceholder="Search by order number..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order #${detailOrder?.orderNumber || detailOrder?._id?.slice(-8) || ''}`} size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : detailOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${STATUS_STYLES[detailOrder.status] || 'bg-gray-50 text-gray-600'}`}>
                  {detailOrder.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold text-gray-900">${Number(detailOrder.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm text-gray-700">{detailOrder.customer?.name || detailOrder.customer?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-700">{detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleString() : '—'}</p>
              </div>
            </div>
            {items.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Items</h4>
                <div className="border rounded-lg divide-y">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-gray-700">{item.medicine?.name || item.name || 'Medicine'}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-medium text-gray-900">${Number(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detailOrder.shippingAddress && (
              <div>
                <p className="text-xs text-gray-500">Shipping Address</p>
                <p className="text-sm text-gray-700">{detailOrder.shippingAddress}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
