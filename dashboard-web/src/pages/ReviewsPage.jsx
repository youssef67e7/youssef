import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Star, CheckCircle, XCircle, MessageSquare, Search, Filter, X } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', rating: '', search: '' });
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.rating) params.rating = filters.rating;
      if (filters.search) params.search = filters.search;
      const res = await reviewsAPI.list(params);
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load reviews');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters.status, filters.rating]);

  const handleApprove = async () => {
    if (!actionId) return;
    setSubmitting(true);
    try {
      await reviewsAPI.approve(actionId);
      toast.success('Review approved');
      setActionId(null);
      setActionType('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!actionId) return;
    setSubmitting(true);
    try {
      await reviewsAPI.reject(actionId);
      toast.success('Review rejected');
      setActionId(null);
      setActionType('');
      setActionReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
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
      toast.error(err.response?.data?.message || 'Failed to reply');
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => {
    return (
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
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Manage customer reviews"
        breadcrumbs={['Dashboard', 'Reviews']}
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
              placeholder="Search reviews..."
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
          </select>
          <select
            value={filters.rating}
            onChange={e => setFilters({ ...filters, rating: e.target.value })}
            className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">User</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Medicine</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Rating</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Comment</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                Loading...
              </td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Star size={48} className="mx-auto mb-2 opacity-50" />
                No reviews found
              </td></tr>
            ) : (
              reviews.map(r => (
                <tr key={r._id || r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3">
                    <span className="font-medium dark:text-white">{r.user?.name || r.userName || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{r.medicine?.name || r.medicineName || '—'}</td>
                  <td className="px-5 py-3">{renderStars(r.rating)}</td>
                  <td className="px-5 py-3 max-w-xs truncate text-gray-600 dark:text-gray-300">{r.comment || r.text || '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status || 'pending'} />
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => { setActionId(r._id || r.id); setActionType('approve'); }}
                          className="text-green-500 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => { setActionId(r._id || r.id); setActionType('reject'); }}
                          className="text-red-500 hover:text-red-700"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => { setReplyModal(r); setReplyText(''); }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Reply"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!actionId && actionType === 'approve'}
        onClose={() => { setActionId(null); setActionType(''); }}
        onConfirm={handleApprove}
        title="Approve Review"
        message="Are you sure you want to approve this review? It will be visible to all users."
        confirmText={submitting ? 'Approving...' : 'Approve'}
        confirmColor="bg-green-600 hover:bg-green-700"
        icon={CheckCircle}
      />

      <ConfirmDialog
        isOpen={!!actionId && actionType === 'reject'}
        onClose={() => { setActionId(null); setActionType(''); setActionReason(''); }}
        onConfirm={handleReject}
        title="Reject Review"
        message="Are you sure you want to reject this review? It will be hidden from users."
        confirmText={submitting ? 'Rejecting...' : 'Reject'}
        icon={XCircle}
      />

      {replyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Reply to Review</h3>
              <button onClick={() => { setReplyModal(null); setReplyText(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium dark:text-white">{replyModal.user?.name || 'User'}:</span>{' '}
                {replyModal.comment || replyModal.text}
              </p>
            </div>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white mb-4"
                placeholder="Write your reply..."
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setReplyModal(null); setReplyText(''); }} className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
