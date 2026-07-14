import { useEffect, useState, useCallback } from 'react';
import { ordersAPI, driversAPI } from '../services/api';
import { Eye, Truck, FileText, ShoppingCart, User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

const statusLabels = {
  pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [drivers, setDrivers] = useState([]);

  const [detailOrder, setDetailOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const [showAssign, setShowAssign] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { limit: 15, page: p };
      if (statusFilter) params.status = statusFilter;

      const [ordersRes, driversRes] = await Promise.allSettled([
        ordersAPI.list(params),
        driversAPI.list({ limit: 100 }),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data;
        setOrders(d?.data || d?.orders || []);
        setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / 15) || 1);
        setTotal(d?.total || d?.totalPages * 15 || 0);
      }
      if (driversRes.status === 'fulfilled') {
        const d = driversRes.value.data?.data || driversRes.value.data || [];
        setDrivers(Array.isArray(d) ? d : d?.drivers || []);
      }
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      toast.success(`Order ${statusLabels[status] || status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return toast.error('Select a driver');
    try {
      await ordersAPI.assignDriver(assignOrderId, selectedDriver);
      toast.success('Driver assigned successfully');
      setShowAssign(false);
      setAssignOrderId(null);
      setSelectedDriver('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  const viewOrderDetail = async (order) => {
    try {
      const res = await ordersAPI.getInvoice(order._id || order.id);
      setInvoiceData(res.data?.data || res.data);
    } catch {
      setInvoiceData(null);
    }
    setDetailOrder(order);
    setShowDetail(true);
  };

  const paymentLabel = (m) => {
    const labels = { cash_on_delivery: 'COD', credit_card: 'Credit Card', debit_card: 'Debit Card', online: 'Online' };
    return labels[m] || m || '—';
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => (
      <span className="font-medium dark:text-white">{v || row._id?.slice(-8) || '—'}</span>
    )},
    { key: 'customer', label: 'Customer', render: (v, row) => (
      <span className="dark:text-gray-300">{v?.name || row.user?.name || '—'}</span>
    )},
    { key: 'totalAmount', label: 'Total', render: (v, row) => (
      <span className="font-medium dark:text-white">${v || row.total || 0}</span>
    )},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? new Date(v).toLocaleDateString() : '—'}</span>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <div className="flex items-center gap-1.5">
        <select
          value={row.status}
          onChange={(e) => handleStatus(row._id || row.id, e.target.value)}
          className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-1.5 py-1 text-xs cursor-pointer"
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <button
          onClick={() => { setAssignOrderId(row._id || row.id); setShowAssign(true); }}
          className="p-1 rounded text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
          title="Assign Driver"
        >
          <Truck size={15} />
        </button>
        <button
          onClick={() => viewOrderDetail(row)}
          className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          title="View Details"
        >
          <Eye size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Orders" subtitle="Manage and track customer orders" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here once customers start placing them."
        onSearch={(val) => {
          if (!val) { setPage(1); load(1); return; }
        }}
        searchPlaceholder="Search orders..."
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: (p) => { setPage(p); load(p); },
        }}
      />

      <Modal open={showAssign} onClose={() => { setShowAssign(false); setAssignOrderId(null); setSelectedDriver(''); }} title="Assign Driver" size="sm">
        <div className="space-y-4">
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option value="">Select a driver</option>
            {drivers.map(d => (
              <option key={d._id || d.id} value={d._id || d.id}>{d.name} ({d.phone || d.email})</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAssign(false); setAssignOrderId(null); setSelectedDriver(''); }}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button onClick={handleAssignDriver}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
              Assign
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showDetail} onClose={() => { setShowDetail(false); setDetailOrder(null); setInvoiceData(null); }} title="Order Details" size="lg">
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                <p className="font-medium dark:text-white">{detailOrder.orderNumber || detailOrder._id?.slice(-8) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <StatusBadge status={detailOrder.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                <p className="font-medium dark:text-white flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" />
                  {detailOrder.customer?.name || detailOrder.user?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                <p className="font-medium dark:text-white">${detailOrder.totalAmount || detailOrder.total || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment</p>
                <p className="dark:text-gray-300">{paymentLabel(detailOrder.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                <p className="dark:text-gray-300">{detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleString() : '—'}</p>
              </div>
            </div>

            {detailOrder.shippingAddress && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivery Address</p>
                <p className="text-sm dark:text-gray-300">
                  {typeof detailOrder.shippingAddress === 'string'
                    ? detailOrder.shippingAddress
                    : `${detailOrder.shippingAddress.street || ''}, ${detailOrder.shippingAddress.city || ''} ${detailOrder.shippingAddress.zipCode || ''}`}
                </p>
              </div>
            )}

            {detailOrder.items?.length > 0 && (
              <div>
                <p className="text-sm font-medium dark:text-white mb-2">Items</p>
                <div className="divide-y dark:divide-gray-700 border dark:border-gray-700 rounded-lg overflow-hidden">
                  {detailOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30">
                      <span className="text-sm dark:text-gray-300">{item.medicine?.name || item.name || `Item ${i + 1}`}</span>
                      <span className="text-sm dark:text-gray-400">x{item.quantity || 1} — ${item.price || item.total || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invoiceData && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice</p>
                <pre className="text-xs dark:text-gray-300 whitespace-pre-wrap font-mono">{JSON.stringify(invoiceData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
