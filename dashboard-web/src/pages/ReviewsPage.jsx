import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star, CheckCircle, XCircle, MessageSquare, StarIcon, MessageCircle } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { limit: 15, page: p };
      if (statusFilter) params.status = statusFilter;

      const res = await reviewsAPI.list(params);
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setReviews(Array.isArray(list) ? list : []);
      setTotalPages(items?.totalPages || Math.ceil((items?.total || 0) / 15) || 1);
      setTotal(items?.total || 0);
    } catch {
      toast.error('Failed to load reviews');
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openConfirm = (id, action) => {
    setConfirmId(id);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmId) return;
    setSubmitting(true);
    try {
      if (confirmAction === 'approve') {
        await reviewsAPI.approve(confirmId);
        toast.success('Review approved');
      } else if (confirmAction === 'reject') {
        await reviewsAPI.reject(confirmId);
        toast.success('Review rejected');
      }
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmAction('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setSubmitting(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyModal || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await reviewsAPI.reply(replyModal._id || replyModal.id, replyText);
      toast.success('Reply sent');
      setReplyModal(null);
      setReplyText('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{rating}</span>
    </div>
  );

  const columns = [
    { key: 'user', label: 'Customer', render: (v, row) => (
      <span className="font-medium dark:text-white">{v?.name || row.userName || '—'}</span>
    )},
    { key: 'medicine', label: 'Medicine', render: (v, row) => (
      <span className="dark:text-gray-300">{v?.name || row.medicineName || '—'}</span>
    )},
    { key: 'rating', label: 'Rating', render: (v) => renderStars(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v || 'pending'} /> },
    { key: 'createdAt', label: 'Date', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? new Date(v).toLocaleDateString() : '—'}</span>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <div className="flex items-center gap-1">
        {row.status !== 'approved' && (
          <button
            onClick={() => openConfirm(row._id || row.id, 'approve')}
            className="p-1 rounded text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
            title="Approve"
          >
            <CheckCircle size={15} />
          </button>
        )}
        {row.status !== 'rejected' && (
          <button
            onClick={() => openConfirm(row._id || row.id, 'reject')}
            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Reject"
          >
            <XCircle size={15} />
          </button>
        )}
        <button
          onClick={() => { setReplyModal(row); setReplyText(''); }}
          className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          title="Reply"
        >
          <MessageSquare size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Reviews" subtitle="Manage customer reviews and feedback" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyIcon={Star}
        emptyTitle="No reviews found"
        emptyDescription="Customer reviews will appear here."
        onSearch={(val) => {
          if (!val) { setPage(1); load(1); }
        }}
        searchPlaceholder="Search by customer name..."
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: (p) => { setPage(p); load(p); },
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmId(null); setConfirmAction(''); }}
        onConfirm={handleConfirm}
        title={confirmAction === 'approve' ? 'Approve Review' : 'Reject Review'}
        message={confirmAction === 'approve'
          ? 'This review will be visible to all customers. Approve it?'
          : 'This review will be hidden from customers. Reject it?'}
        confirmText={submitting ? 'Processing...' : (confirmAction === 'approve' ? 'Approve' : 'Reject')}
        confirmVariant={confirmAction === 'approve' ? 'primary' : 'danger'}
      />

      <Modal open={!!replyModal} onClose={() => { setReplyModal(null); setReplyText(''); }} title="Reply to Review" size="md">
        {replyModal && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium dark:text-white">{replyModal.user?.name || 'Customer'}:</span>{' '}
                {replyModal.comment || replyModal.text}
              </p>
            </div>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your reply..."
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setReplyModal(null); setReplyText(''); }}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !replyText.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
