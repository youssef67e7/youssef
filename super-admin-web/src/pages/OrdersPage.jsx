import { useEffect, useState, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import {
  ShoppingCart, Eye, X, Clock, CheckCircle2, XCircle,
  Truck, Package, DollarSign, User, MapPin
} from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusIndicator from '../components/StatusIndicator';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const statusFilters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};
const statusColors = {
  pending: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  confirmed: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  processing: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  shipped: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  delivered: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  cancelled: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async (p = page, s = search, f = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      if (f !== 'all') params.status = f;
      const res = await ordersAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(Math.ceil(data.length / 10) || 1);
        setTotal(data.length);
      } else {
        setOrders(Array.isArray(data?.orders) ? data.orders : Array.isArray(data) ? data : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || data?.totalItems || 0);
      }
    } catch {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => { setSearch(val); setPage(1); load(1, val, statusFilter); };
  const handleStatusFilter = (f) => { setStatusFilter(f); setPage(1); load(1, search, f); };

  const columns = [
    {
      key: 'orderNumber', label: 'Order', sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <ShoppingCart size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium dark:text-white">#{row.orderNumber || row._id?.slice(-6) || '—'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'customer', label: 'Customer',
      render: (_, row) => {
        const name = row.user?.name || row.customerName || row.customer?.name || '—';
        const email = row.user?.email || row.customerEmail || row.customer?.email || '';
        return (
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-sm dark:text-white">{name}</p>
              {email && <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'items', label: 'Items',
      render: (_, row) => {
        const items = row.items || row.orderItems || [];
        return <span className="dark:text-gray-300">{items.length || row.totalItems || 0} items</span>;
      },
    },
    {
      key: 'totalAmount', label: 'Total', sortable: true,
      render: (val) => (
        <span className="font-semibold dark:text-white">${(val || 0).toFixed(2)}</span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (val) => {
        const Icon = statusIcons[val] || Package;
        const color = statusColors[val] || 'text-gray-500 bg-gray-50 dark:bg-gray-700';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
            <Icon size={12} />
            {(val || 'unknown').charAt(0).toUpperCase() + (val || '').slice(1)}
          </span>
        );
      },
    },
    {
      key: 'paymentMethod', label: 'Payment',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '50px',
      render: (_, row) => (
        <button
          onClick={() => setDetail(row)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="View details"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const order = detail;
  const items = order ? (order.items || order.orderItems || []) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={`${total} orders across the platform`} />

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => handleStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders found"
        emptyDescription="No orders match your current filters."
        searchPlaceholder="Search by order number or customer..."
        onSearch={handleSearch}
        pagination={{ page, totalPages, total, onPageChange: (p) => { setPage(p); load(p, search, statusFilter); } }}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Order #${detail?.orderNumber || detail?._id?.slice(-6) || ''}`} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Status', value: (detail.status || '—').charAt(0).toUpperCase() + (detail.status || '').slice(1) },
                { label: 'Total', value: `$${(detail.totalAmount || 0).toFixed(2)}` },
                { label: 'Payment', value: detail.paymentMethod || '—' },
                { label: 'Date', value: formatDate(detail.createdAt) },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-medium dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
              <p className="text-sm font-medium dark:text-white">
                {detail.user?.name || detail.customerName || detail.customer?.name || '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {detail.user?.email || detail.customerEmail || detail.customer?.email || ''}
              </p>
            </div>

            {detail.shippingAddress && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Shipping Address</p>
                  <p className="text-sm dark:text-white">{typeof detail.shippingAddress === 'string' ? detail.shippingAddress : `${detail.shippingAddress.street || ''} ${detail.shippingAddress.city || ''}`}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium dark:text-white mb-2">Items ({items.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <Package size={16} className="text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">{item.medicine?.name || item.name || 'Medicine'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="text-sm font-semibold dark:text-white">${(item.price || item.unitPrice || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
