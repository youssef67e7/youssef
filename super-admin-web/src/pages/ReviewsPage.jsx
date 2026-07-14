import { useEffect, useState, useCallback } from 'react';
import { reviewsAPI } from '../services/api';
import {
  Star, Eye, CheckCircle2, XCircle, MessageSquare, Trash2,
  User, ThumbsUp, ThumbsDown, Clock
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusIndicator from '../components/StatusIndicator';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const statusFilters = ['all', 'APPROVED', 'PENDING', 'REJECTED'];

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= (rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
      ))}
    </div>
  );
}

function timeAgo(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (p = page, s = search, f = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      if (f !== 'all') params.status = f;
      const res = await reviewsAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setReviews(data);
        setTotalPages(Math.ceil(data.length / 10) || 1);
        setTotal(data.length);
      } else {
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      }
    } catch {
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => { setSearch(val); setPage(1); load(1, val, statusFilter); };
  const handleStatusFilter = (f) => { setStatusFilter(f); setPage(1); load(1, search, f); };

  const handleStatusUpdate = async (id, status) => {
    try {
      await reviewsAPI.updateStatus(id, status);
      toast.success(`Review ${status.toLowerCase()}`);
      setDetail(null);
      load();
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reviewsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Review deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const columns = [
    {
      key: 'user', label: 'Reviewer',
      render: (_, row) => {
        const name = row.user?.name || row.customerName || row.customer?.name || 'Anonymous';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <User size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-medium dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(row.createdAt)}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: (val) => <StarRating rating={val} />,
    },
    {
      key: 'comment', label: 'Review',
      render: (val) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">{val || '—'}</p>
      ),
    },
    {
      key: 'medicine', label: 'Medicine',
      render: (_, row) => (
        <span className="text-sm dark:text-gray-300">{row.medicine?.name || row.medicineName || '—'}</span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (val) => <StatusIndicator status={val?.toLowerCase() || 'pending'} />,
    },
    {
      key: 'actions', label: '', width: '150px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setDetail(row)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" title="View">
            <Eye size={16} />
          </button>
          {row.status !== 'APPROVED' && (
            <button onClick={() => handleStatusUpdate(row._id || row.id, 'APPROVED')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-green-500" title="Approve">
              <CheckCircle2 size={16} />
            </button>
          )}
          {row.status !== 'REJECTED' && (
            <button onClick={() => handleStatusUpdate(row._id || row.id, 'REJECTED')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-red-500" title="Reject">
              <XCircle size={16} />
            </button>
          )}
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-red-500" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" subtitle={`${total} customer reviews`} />

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button key={f} onClick={() => handleStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyIcon={Star}
        emptyTitle="No reviews found"
        emptyDescription="No reviews match your current filters."
        searchPlaceholder="Search reviews..."
        onSearch={handleSearch}
        pagination={{ page, totalPages, total, onPageChange: (p) => { setPage(p); load(p, search, statusFilter); } }}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Review Details" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium dark:text-white">{detail.user?.name || detail.customerName || 'Anonymous'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(detail.createdAt)}</p>
              </div>
            </div>
            <StarRating rating={detail.rating} size={20} />
            <p className="text-sm text-gray-700 dark:text-gray-300">{detail.comment || 'No comment provided.'}</p>
            {detail.medicine && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Medicine: {detail.medicine?.name || '—'}</p>
            )}
            <div className="flex gap-2 pt-2">
              {detail.status !== 'APPROVED' && (
                <button onClick={() => handleStatusUpdate(detail._id || detail.id, 'APPROVED')} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                  <ThumbsUp size={14} /> Approve
                </button>
              )}
              {detail.status !== 'REJECTED' && (
                <button onClick={() => handleStatusUpdate(detail._id || detail.id, 'REJECTED')} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
                  <ThumbsDown size={14} /> Reject
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Review" confirmText="Delete" confirmVariant="danger" message="Are you sure you want to delete this review? This cannot be undone." />
    </div>
  );
}
