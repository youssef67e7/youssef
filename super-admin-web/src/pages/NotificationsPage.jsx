import { useEffect, useState, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import {
  Bell, Send, Trash2, Users, Clock, CheckCircle2,
  AlertTriangle, Info, Megaphone, Plus
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusIndicator from '../components/StatusIndicator';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const typeIcons = {
  SYSTEM: Info,
  PROMOTION: Megaphone,
  ORDER_UPDATE: Bell,
  PAYMENT_UPDATE: CheckCircle2,
  DELIVERY_UPDATE: AlertTriangle,
  WALLET: Info,
  LOYALTY: CheckCircle2,
  REVIEW: Info,
  SUPPORT: AlertTriangle,
  REFERRAL: Megaphone,
};
const typeColors = {
  SYSTEM: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  PROMOTION: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  ORDER_UPDATE: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
  PAYMENT_UPDATE: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  DELIVERY_UPDATE: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  WALLET: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  LOYALTY: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  REVIEW: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  SUPPORT: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  REFERRAL: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

const TYPE_OPTIONS = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'ORDER_UPDATE', label: 'Order Update' },
  { value: 'PAYMENT_UPDATE', label: 'Payment Update' },
  { value: 'DELIVERY_UPDATE', label: 'Delivery Update' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'LOYALTY', label: 'Loyalty' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'REFERRAL', label: 'Referral' },
];

function timeAgo(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ title: '', body: '', type: 'SYSTEM', target: 'all' });
  const [sendLoading, setSendLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      const res = await notificationsAPI.list(params);
      const payload = res.data;
      const data = payload?.data || payload;
      if (Array.isArray(data)) {
        setNotifications(data);
        setTotalPages(payload?.meta?.totalPages || Math.ceil(data.length / 10) || 1);
        setTotal(payload?.meta?.total || data.length);
      } else {
        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        setTotalPages(data?.totalPages || payload?.meta?.totalPages || 1);
        setTotal(data?.total || payload?.meta?.total || 0);
      }
    } catch {
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => { setSearch(val); setPage(1); load(1, val); };

  const handleSend = async () => {
    if (!sendForm.title.trim() || !sendForm.body.trim()) { toast.error('Title and message are required'); return; }
    setSendLoading(true);
    try {
      if (sendForm.target === 'all') {
        await notificationsAPI.sendToAll({ title: sendForm.title, body: sendForm.body, type: sendForm.type });
      } else {
        await notificationsAPI.sendBulk({ title: sendForm.title, body: sendForm.body, type: sendForm.type, target: sendForm.target });
      }
      toast.success('Notification sent');
      setShowSend(false);
      setSendForm({ title: '', body: '', type: 'SYSTEM', target: 'all' });
      load();
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSendLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await notificationsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Notification deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    {
      key: 'title', label: 'Notification',
      render: (_, row) => {
        const Icon = typeIcons[row.type] || Bell;
        const color = typeColors[row.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-700';
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="font-medium dark:text-white">{row.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{row.body || row.message || '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type', label: 'Type',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'user', label: 'Recipient',
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {typeof val === 'object' ? (val?.name || val?.email || '—') : (val || 'All')}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Sent', sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={13} />
          {timeAgo(val)}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '60px',
      render: (_, row) => (
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-red-500" title="Delete">
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${total} notifications sent`}
        actions={
          <button onClick={() => setShowSend(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
            <Send size={16} /> Send Notification
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        emptyIcon={Bell}
        emptyTitle="No notifications"
        emptyDescription="No notifications have been sent yet."
        emptyAction={{ label: 'Send Notification', onClick: () => setShowSend(true) }}
        searchPlaceholder="Search notifications..."
        onSearch={handleSearch}
        pagination={{ page, totalPages, total, onPageChange: (p) => { setPage(p); load(p, search); } }}
      />

      <Modal open={showSend} onClose={() => setShowSend(false)} title="Send Notification" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })} placeholder="Notification title" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Message *</label>
            <textarea value={sendForm.body} onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })} rows={3} placeholder="Notification message" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Type</label>
              <select value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Target</label>
              <select value={sendForm.target} onChange={(e) => setSendForm({ ...sendForm, target: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
                <option value="all">All Users</option>
                <option value="customers">Customers Only</option>
                <option value="pharmacists">Pharmacists Only</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowSend(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">Cancel</button>
            <button onClick={handleSend} disabled={sendLoading} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
              <Send size={14} />
              {sendLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Notification" confirmText="Delete" confirmVariant="danger" message="Are you sure you want to delete this notification?" />
    </div>
  );
}
