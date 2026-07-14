import { useState, useEffect, useCallback } from 'react';
import { Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import { deliveryAPI } from '../services/api';

const STATUS_OPTIONS = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'];
const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-600',
  assigned: 'bg-blue-50 text-blue-600',
  picked_up: 'bg-indigo-50 text-indigo-600',
  in_transit: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  failed: 'bg-red-50 text-red-600',
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await deliveryAPI.list(params);
      const d = data.data || data;
      setDeliveries(d.deliveries || d.items || d || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await deliveryAPI.updateStatus(id, newStatus);
      toast.success('Delivery status updated');
      fetchDeliveries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => <span className="font-medium text-gray-900">#{v || row.order?.orderNumber || row._id?.slice(-8)}</span> },
    { key: 'driver', label: 'Driver', render: (v) => v?.name || v?.email || '—' },
    { key: 'status', label: 'Status', render: (v, row) => (
      <select
        value={v || 'pending'}
        onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-primary-300 cursor-pointer ${STATUS_STYLES[v] || 'bg-gray-50 text-gray-600'}`}
      >
        {STATUS_OPTIONS.filter((s) => s !== 'all').map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
        ))}
      </select>
    )},
    { key: 'address', label: 'Address', render: (v, row) => <span className="text-gray-500 truncate max-w-xs block">{v || row.shippingAddress || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage deliveries</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        loading={loading}
        emptyIcon={Truck}
        emptyTitle="No deliveries found"
        emptyDescription="Deliveries will appear here once orders are shipped"
        searchPlaceholder="Search by order number..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </div>
  );
}
