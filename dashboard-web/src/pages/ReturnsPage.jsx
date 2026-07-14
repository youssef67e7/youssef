import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, DollarSign, RotateCcw } from 'lucide-react';
import { returnsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const RETURN_STATUSES = ['pending', 'approved', 'rejected', 'processed'];

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [showRejectReason, setShowRejectReason] = useState(false);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { limit: 15, page: p };
      if (statusFilter) params.status = statusFilter;

      const res = await returnsAPI.list(params);
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.returns || raw?.data || []);
      setReturns(Array.isArray(list) ? list : []);
      setTotalPages(raw?.totalPages || Math.ceil((raw?.total || 0) / 15) || 1);
      setTotal(raw?.total || 0);
    } catch {
      toast.error('Failed to load returns');
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    if (!selectedReturn) return;
    setSubmitting(true);
    try {
      await returnsAPI.approve(selectedReturn._id || selectedReturn.id);
      toast.success('Return approved');
      setConfirmOpen(false);
      setSelectedReturn(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!selectedReturn) return;
    setSubmitting(true);
    try {
      await returnsAPI.reject(selectedReturn._id || selectedReturn.id, rejectReason || undefined);
      toast.success('Return rejected');
      setShowRejectReason(false);
      setSelectedReturn(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
    setSubmitting(false);
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSubmitting(true);
    try {
      await returnsAPI.processRefund({
        returnId: selectedReturn._id || selectedReturn.id,
        amount: Number(refundAmount),
        method: refundMethod,
      });
      toast.success('Refund processed successfully');
      setShowRefund(false);
      setSelectedReturn(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => (
      <span className="font-medium dark:text-white">{v || row.order?.orderNumber || row.orderId?.slice(-8) || '—'}</span>
    )},
    { key: 'customer', label: 'Customer', render: (v, row) => (
      <span className="dark:text-gray-300">{v?.name || row.user?.name || row.customerName || '—'}</span>
    )},
    { key: 'reason', label: 'Reason', render: (v) => (
      <span className="dark:text-gray-300 max-w-[200px] truncate block">{v || '—'}</span>
    )},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v || 'pending'} /> },
    { key: 'createdAt', label: 'Date', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? new Date(v).toLocaleDateString() : '—'}</span>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <div className="flex items-center gap-1">
        {row.status === 'pending' && (
          <>
            <button
              onClick={() => { setSelectedReturn(row); setConfirmAction('approve'); setConfirmOpen(true); }}
              className="p-1 rounded text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
              title="Approve"
            >
              <CheckCircle size={15} />
            </button>
            <button
              onClick={() => { setSelectedReturn(row); setRejectReason(''); setShowRejectReason(true); }}
              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Reject"
            >
              <XCircle size={15} />
            </button>
          </>
        )}
        {row.status === 'approved' && (
          <button
            onClick={() => { setSelectedReturn(row); setRefundAmount(row.orderTotal || row.totalAmount || ''); setRefundMethod('original'); setShowRefund(true); }}
            className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Process Refund"
          >
            <DollarSign size={15} />
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Returns" subtitle="Manage return and refund requests" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {RETURN_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        emptyIcon={RotateCcw}
        emptyTitle="No return requests"
        emptyDescription="Return requests will appear here when customers initiate them."
        onSearch={(val) => {
          if (!val) { setPage(1); load(1); }
        }}
        searchPlaceholder="Search by order number..."
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: (p) => { setPage(p); load(p); },
        }}
      />

      <ConfirmDialog
        open={confirmOpen && confirmAction === 'approve'}
        onClose={() => { setConfirmOpen(false); setSelectedReturn(null); setConfirmAction(''); }}
        onConfirm={handleApprove}
        title="Approve Return"
        message="Approve this return request? The order will be marked for return processing."
        confirmText={submitting ? 'Approving...' : 'Approve'}
        confirmVariant="primary"
      />

      <Modal open={showRejectReason} onClose={() => { setShowRejectReason(false); setSelectedReturn(null); setRejectReason(''); }} title="Reject Return" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Provide a reason for rejecting this return request:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Reason for rejection..."
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowRejectReason(false); setSelectedReturn(null); setRejectReason(''); }}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button onClick={handleReject} disabled={submitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
              {submitting ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showRefund} onClose={() => { setShowRefund(false); setSelectedReturn(null); }} title="Process Refund" size="sm">
        <form onSubmit={handleRefund} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Amount</label>
            <input
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Method</label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="original">Original Payment Method</option>
              <option value="wallet">Wallet Credit</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowRefund(false); setSelectedReturn(null); }}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
              {submitting ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
