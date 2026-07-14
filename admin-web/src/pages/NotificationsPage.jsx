import { useState, useEffect, useCallback } from 'react';
import { Send, History, Trash2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { notificationsAPI } from '../services/api';

export default function NotificationsPage() {
  const [tab, setTab] = useState('send');
  const [form, setForm] = useState({ title: '', body: '', type: 'info' });
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data } = await notificationsAPI.list({ page, limit: 15 });
      const d = data.data || data;
      const raw = d.notifications || d.items || d || [];
      setHistory(Array.isArray(raw) ? raw : []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      // History endpoint might not exist
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab, fetchHistory]);

  const handleSend = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.body.trim()) return toast.error('Message body is required');
    setSending(true);
    try {
      await notificationsAPI.sendToAll(form);
      toast.success('Notification sent to all users');
      setForm({ title: '', body: '', type: 'info' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await notificationsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Notification deleted');
      fetchHistory();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'body', label: 'Message', render: (v) => <span className="text-gray-500 truncate max-w-xs block">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => (
      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">{v || 'info'}</span>
    )},
    { key: 'createdAt', label: 'Sent', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', width: '80px', render: (_, row) => (
      <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
        <Trash2 size={16} />
      </button>
    )},
  ];

  const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Send and manage notifications</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('send')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${tab === 'send' ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
        >
          <Send size={16} /> Send
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${tab === 'history' ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
        >
          <History size={16} /> History
        </button>
      </div>

      {tab === 'send' ? (
        <div className="bg-white rounded-xl border p-6 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <Bell size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Send to All Users</h2>
              <p className="text-sm text-gray-500">This will be sent to every registered user</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
            </div>
            <div>
              <label className={labelClass}>Message *</label>
              <textarea rows={4} className={inputClass} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your notification message..." />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="info">Info</option>
                <option value="promotion">Promotion</option>
                <option value="order">Order Update</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send to All Users'}
            </button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={history}
          loading={historyLoading}
          emptyIcon={Bell}
          emptyTitle="No notifications sent"
          emptyDescription="Sent notifications will appear here"
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification from history?"
        confirmText="Delete"
      />
    </div>
  );
}
