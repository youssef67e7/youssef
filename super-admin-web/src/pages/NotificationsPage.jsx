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
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  promotion: Megaphone,
  order: Bell,
};
const typeColors = {
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  success: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  promotion: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  order: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
};

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
  const [sendForm, setSendForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const [sendLoading, setSendLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      const res = await notificationsAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setNotifications(data);
        setTotalPages(Math.ceil(data.length / 10) || 1);
        setTotal(data.length);
      } else {
        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
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
    if (!sendForm.title.trim() || !sendForm.message.trim()) { toast.error('Title and message are required'); return; }
    setSendLoading(true);
    try {
      if (sendForm.target === 'all') {
        await notificationsAPI.sendToAll({ title: sendForm.title, message: sendForm.message, type: sendForm.type });
      } else {
        await notificationsAPI.sendBulk({ title: sendForm.title, message: sendForm.message, type: sendForm.type, target: sendForm.target });
      }
      toast.success('Notification sent');
      setShowSend(false);
      setSendForm({ title: '', message: '', type: 'info', target: 'all' });
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
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{row.message || '—'}</p>
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
            <textarea value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} rows={3} placeholder="Notification message" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Type</label>
              <select value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
                {['info', 'warning', 'success', 'promotion', 'order'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
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
