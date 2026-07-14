import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Send, Bell, Users, Trash2 } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPES = ['GENERAL', 'PROMOTION', 'ORDER_UPDATE', 'DELIVERY'];

export default function NotificationsPage() {
  const [tab, setTab] = useState('send');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({ title: '', body: '', type: 'GENERAL' });
  const [sending, setSending] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await notificationsAPI.history({ limit: 15, page: p });
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.notifications || raw?.data || []);
      setHistory(Array.isArray(list) ? list : []);
      setTotalPages(raw?.totalPages || Math.ceil((raw?.total || 0) / 15) || 1);
      setTotal(raw?.total || 0);
    } catch {
      toast.error('Failed to load notification history');
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, loadHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Title and body are required');
    setSending(true);
    try {
      await notificationsAPI.send({ title: form.title, body: form.body, type: form.type || undefined });
      toast.success('Notification sent');
      setForm({ title: '', body: '', type: 'GENERAL' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    }
    setSending(false);
  };

  const handleSendAll = async () => {
    if (!form.title || !form.body) return toast.error('Title and body are required');
    setSending(true);
    try {
      await notificationsAPI.sendAll({ title: form.title, body: form.body, type: form.type || undefined });
      toast.success('Notification sent to all users');
      setForm({ title: '', body: '', type: 'GENERAL' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    }
    setSending(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await notificationsAPI.delete(deleteId);
      toast.success('Notification deleted');
      setDeleteId(null);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
    setDeleting(false);
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v) => (
      <span className="font-medium dark:text-white">{v || '—'}</span>
    )},
    { key: 'body', label: 'Body', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 max-w-[250px] truncate block">{v || '—'}</span>
    )},
    { key: 'type', label: 'Type', render: (v) => (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {v || 'GENERAL'}
      </span>
    )},
    { key: 'createdAt', label: 'Date', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? new Date(v).toLocaleString() : '—'}</span>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <button
        onClick={() => setDeleteId(row._id || row.id)}
        className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle="Send and manage notifications" />

      <div className="flex gap-0 border-b dark:border-gray-700">
        <button
          onClick={() => setTab('send')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'send'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Send size={16} className="inline mr-1.5" />
          Send Notification
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'history'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Bell size={16} className="inline mr-1.5" />
          History
        </button>
      </div>

      {tab === 'send' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="font-semibold dark:text-white mb-4">Compose Notification</h2>
          <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Notification message..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                <Send size={16} /> {sending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={handleSendAll} disabled={sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                <Users size={16} /> {sending ? 'Sending...' : 'Send to All'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
          emptyIcon={Bell}
          emptyTitle="No notifications sent"
          emptyDescription="Notification history will appear here after you send notifications."
          pagination={{
            page,
            totalPages,
            total,
            onPageChange: (p) => { setPage(p); loadHistory(p); },
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification from history? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
      />
    </div>
  );
}
