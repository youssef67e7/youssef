import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { returnsAPI } from '../services/api';

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
const statusColors = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await returnsAPI.list(params);
      const d = data?.data || data;
      setReturns(d.returns || d.items || d || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const openDetail = (ret) => {
    setDetailModal(ret);
    setNewStatus(ret.status || 'PENDING');
    setUpdateReason('');
  };

  const handleUpdateStatus = async () => {
    if (!detailModal) return;
    setUpdating(true);
    try {
      await returnsAPI.updateStatus(detailModal._id || detailModal.id, newStatus, updateReason || undefined);
      toast.success('Status updated');
      setDetailModal(null);
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => (
      <span className="font-medium text-gray-900">{v || row.order?.orderNumber || row.order?._id?.slice(-6) || '—'}</span>
    )},
    { key: 'customer', label: 'Customer', render: (v, row) => v?.name || row.user?.name || row.order?.user?.name || '—' },
    { key: 'type', label: 'Type', render: (v) => (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${v === 'exchange' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
        {v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Return'}
      </span>
    )},
    { key: 'reason', label: 'Reason', render: (v) => (
      <span className="text-sm text-gray-600 truncate max-w-[200px] block">{v || '—'}</span>
    )},
    { key: 'status', label: 'Status', render: (v) => (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[v] || 'bg-gray-50 text-gray-600'}`}>{v || '—'}</span>
    )},
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: '', width: '40px', render: (_, row) => (
      <button onClick={() => openDetail(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
        <Eye size={16} />
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
        <p className="text-sm text-gray-500 mt-1">Manage customer return and exchange requests</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        emptyIcon={RotateCcw}
        emptyTitle="No returns found"
        emptyDescription="There are no return requests matching your filter"
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Return Details">
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order #</p>
                <p className="font-medium text-gray-900">{detailModal.orderNumber || detailModal.order?.orderNumber || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{detailModal.customer?.name || detailModal.user?.name || detailModal.order?.user?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900 capitalize">{detailModal.type || 'Return'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{detailModal.reason || 'No reason provided'}</p>
            </div>

            {detailModal.items?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="border rounded-lg divide-y">
                  {detailModal.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-sm">
                      <span className="text-gray-900">{item.medicine?.name || item.name || `Item ${i + 1}`}</span>
                      <span className="text-gray-500">Qty: {item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
              <div className="space-y-3">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} placeholder="Reason for status change (optional)" rows={2} className={inputClass} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updating} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
