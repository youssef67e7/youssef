import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, MessageSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { reviewsAPI } from '../services/api';

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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = { limit: 15, page: p };
      if (statusFilter) params.status = statusFilter;
      const { data } = await reviewsAPI.list(params);
      const raw = data?.data || data;
      const list = Array.isArray(raw) ? raw : (raw?.reviews || raw?.data || []);
      setReviews(Array.isArray(list) ? list : []);
      setTotalPages(raw?.totalPages || Math.ceil((raw?.total || 0) / 15) || 1);
      setTotal(raw?.total || 0);
    } catch { toast.error('Failed to load reviews'); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openConfirm = (id, action) => { setConfirmId(id); setConfirmAction(action); setConfirmOpen(true); };

  const handleConfirm = async () => {
    if (!confirmId) return;
    setSubmitting(true);
    try {
      if (confirmAction === 'approve') {
        await reviewsAPI.updateStatus(confirmId, 'APPROVED');
        toast.success('Review approved');
      } else if (confirmAction === 'reject') {
        await reviewsAPI.updateStatus(confirmId, 'REJECTED');
        toast.success('Review rejected');
      }
      setConfirmOpen(false); setConfirmId(null); setConfirmAction(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    setSubmitting(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyModal || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await reviewsAPI.adminReply(replyModal._id || replyModal.id, replyText);
      toast.success('Reply sent');
      setReplyModal(null); setReplyText(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await reviewsAPI.delete(deleteTarget._id || deleteTarget.id); toast.success('Review deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating}</span>
    </div>
  );

  const columns = [
    { key: 'user', label: 'Customer', render: (v) => <span className="font-medium text-gray-900">{v?.name || '—'}</span> },
    { key: 'medicine', label: 'Medicine', render: (v) => v?.name || '—' },
    { key: 'rating', label: 'Rating', render: (v) => renderStars(v) },
    { key: 'comment', label: 'Comment', render: (v) => <span className="text-gray-500 text-xs line-clamp-2">{v || '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => {
      const colors = { APPROVED: 'bg-green-50 text-green-700', REJECTED: 'bg-red-50 text-red-700', PENDING: 'bg-yellow-50 text-yellow-700', FLAGGED: 'bg-orange-50 text-orange-700' };
      return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors[v] || 'bg-gray-50 text-gray-500'}`}>{v || 'PENDING'}</span>;
    }},
    { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs text-gray-500">{v ? new Date(v).toLocaleDateString() : '—'}</span> },
    { key: 'actions', label: 'Actions', width: '120px', render: (_, row) => (
      <div className="flex items-center gap-1">
        {row.status !== 'APPROVED' && (
          <button onClick={() => openConfirm(row._id || row.id, 'approve')} className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition" title="Approve"><CheckCircle size={15} /></button>
        )}
        {row.status !== 'REJECTED' && (
          <button onClick={() => openConfirm(row._id || row.id, 'reject')} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition" title="Reject"><XCircle size={15} /></button>
        )}
        <button onClick={() => { setReplyModal(row); setReplyText(''); }} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition" title="Reply"><MessageSquare size={15} /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Manage customer reviews and feedback</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyIcon={Star}
        emptyTitle="No reviews found"
        emptyDescription="Customer reviews will appear here."
        searchPlaceholder="Search reviews..."
        pagination={{ page, totalPages, total, onPageChange: (p) => { setPage(p); load(p); } }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmId(null); setConfirmAction(''); }}
        onConfirm={handleConfirm}
        title={confirmAction === 'approve' ? 'Approve Review' : 'Reject Review'}
        message={confirmAction === 'approve' ? 'This review will be visible to all customers. Approve it?' : 'This review will be hidden from customers. Reject it?'}
        confirmText={submitting ? 'Processing...' : (confirmAction === 'approve' ? 'Approve' : 'Reject')}
      />

      <Modal open={!!replyModal} onClose={() => { setReplyModal(null); setReplyText(''); }} title="Reply to Review">
        {replyModal && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{replyModal.user?.name || 'Customer'}:</span>{' '}
                {replyModal.comment || replyModal.text}
              </p>
            </div>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} required rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                placeholder="Write your reply..." />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setReplyModal(null); setReplyText(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={submitting || !replyText.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message={`Are you sure you want to delete this review? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
