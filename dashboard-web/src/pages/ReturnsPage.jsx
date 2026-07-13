import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, DollarSign, Search, Filter, RotateCcw, X } from 'lucide-react';
import { returnsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [modalType, setModalType] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await returnsAPI.list(params);
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setReturns(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load returns');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters.status]);

  const openApprove = (ret) => {
    setSelectedReturn(ret);
    setRefundAmount(ret.orderTotal || ret.totalAmount || '');
    setRefundMethod('original');
    setModalType('approve');
  };

  const openReject = (ret) => {
    setSelectedReturn(ret);
    setRejectReason('');
    setModalType('reject');
  };

  const openRefund = (ret) => {
    setSelectedReturn(ret);
    setRefundAmount(ret.orderTotal || ret.totalAmount || '');
    setRefundMethod('original');
    setModalType('refund');
  };

  const handleApprove = async () => {
    if (!selectedReturn) return;
    setSubmitting(true);
    try {
      await returnsAPI.approve(selectedReturn._id || selectedReturn.id);
      toast.success('Return approved');
      setModalType('');
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
      setModalType('');
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
      await returnsAPI.processRefund(selectedReturn._id || selectedReturn.id, {
        amount: Number(refundAmount),
        method: refundMethod,
      });
      toast.success('Refund processed');
      setModalType('');
      setSelectedReturn(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    }
    setSubmitting(false);
  };

  const closeModal = () => {
    setModalType('');
    setSelectedReturn(null);
    setRejectReason('');
    setRefundAmount('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns"
        subtitle="Manage return and refund requests"
        breadcrumbs={['Dashboard', 'Returns']}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && load()}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Search by order # or customer..."
            />
          </div>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Refunded</option>
          </select>
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Order #</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Customer</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Reason</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <RotateCcw size={48} className="mx-auto mb-2 opacity-50" />
                  No return requests found
                </td></tr>
              ) : (
                returns.map(ret => (
                  <tr key={ret._id || ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 font-medium dark:text-white">
                      {ret.orderNumber || ret.order?.orderNumber || ret.orderId?.slice(-8) || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {ret.user?.name || ret.customer?.name || ret.customerName || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {ret.reason || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={ret.status || 'pending'} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {ret.status === 'pending' && (
                          <>
                            <button onClick={() => openApprove(ret)} className="text-green-500 hover:text-green-700" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => openReject(ret)} className="text-red-500 hover:text-red-700" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {ret.status === 'approved' && (
                          <button onClick={() => openRefund(ret)} className="text-blue-500 hover:text-blue-700" title="Process Refund">
                            <DollarSign size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={modalType === 'approve'}
        onClose={closeModal}
        onConfirm={handleApprove}
        title="Approve Return"
        message={`Approve this return request? The order will be marked for return processing.`}
        confirmText={submitting ? 'Approving...' : 'Approve'}
        confirmColor="bg-green-600 hover:bg-green-700"
        icon={CheckCircle}
      />

      {modalType === 'reject' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Reject Return</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex justify-center mb-4"><XCircle size={48} className="text-red-400" /></div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Provide a reason for rejecting this return request:</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white mb-4"
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:text-gray-300">Cancel</button>
              <button onClick={handleReject} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'refund' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Process Refund</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="original">Original Payment Method</option>
                  <option value="wallet">Wallet Credit</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
