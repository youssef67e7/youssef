import { useState } from 'react';
import { notificationsAPI } from '../services/api';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('GENERAL');
  const [loading, setLoading] = useState(false);

  const handleSendAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notificationsAPI.sendToAll({ title, body, type });
      toast.success('Notification sent to all users');
      setTitle(''); setBody('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Send Push Notification</h2>
        <form onSubmit={handleSendAll} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="Notification title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} required rows={4} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="Notification message..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm">
              <option value="GENERAL">General</option>
              <option value="PROMOTION">Promotion</option>
              <option value="ORDER_UPDATE">Order Update</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
            <Send size={16} /> {loading ? 'Sending...' : 'Send to All Users'}
          </button>
        </form>
      </div>
    </div>
  );
}
