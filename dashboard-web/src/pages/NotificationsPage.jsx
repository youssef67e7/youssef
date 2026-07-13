import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, Trash2, History, Bell, Users, X } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { title: '', body: '', type: 'GENERAL', targetUsers: '', targetRole: '' };

export default function NotificationsPage() {
  const [tab, setTab] = useState('send');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.history();
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setHistory(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load history');
    }
    setLoading(false);
  };

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const data = {
        title: form.title,
        body: form.body,
        type: form.type || undefined,
      };
      if (form.targetUsers) data.userIds = form.targetUsers.split(',').map(s => s.trim()).filter(Boolean);
      if (form.targetRole) data.role = form.targetRole;
      await notificationsAPI.send(data);
      toast.success('Notification sent');
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const handleSendAll = async () => {
    if (!form.title || !form.body) {
      toast.error('Title and body are required');
      return;
    }
    setSending(true);
    try {
      await notificationsAPI.sendAll({ title: form.title, body: form.body, type: form.type || undefined });
      toast.success('Notification sent to all users');
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await notificationsAPI.delete(deleteId);
      toast.success('Notification deleted');
      setDeleteId(null);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Send and manage notifications"
        breadcrumbs={['Dashboard', 'Notifications']}
      />

      <div className="flex gap-2 border-b dark:border-gray-700">
        <button
          onClick={() => setTab('send')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'send'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Send size={16} className="inline mr-1.5" />
          Send Notification
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <History size={16} className="inline mr-1.5" />
          History
        </button>
      </div>

      {tab === 'send' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
            <Bell size={20} /> Compose Notification
          </h2>
          <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body *</label>
              <textarea
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Notification message..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="GENERAL">General</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="ORDER_UPDATE">Order Update</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Users (IDs, comma-sep)</label>
                <input
                  value={form.targetUsers}
                  onChange={e => setForm({ ...form, targetUsers: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="user1, user2 (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
                <select
                  value={form.targetRole}
                  onChange={e => setForm({ ...form, targetRole: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                  <option value="driver">Drivers</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={sending} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                <Send size={16} /> {sending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={handleSendAll} disabled={sending} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                <Users size={16} /> {sending ? 'Sending...' : 'Send to All Users'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Title</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Body</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Sent To</th>
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
              ) : history.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Bell size={48} className="mx-auto mb-2 opacity-50" />
                  No notifications sent yet
                </td></tr>
              ) : (
                history.map(n => (
                  <tr key={n._id || n.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 font-medium dark:text-white">{n.title}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{n.body}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {n.type || 'GENERAL'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {n.targetRole || (n.userIds?.length ? `${n.userIds.length} users` : 'All')}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDeleteId(n._id || n.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification from history?"
        confirmText="Delete"
      />
    </div>
  );
}
