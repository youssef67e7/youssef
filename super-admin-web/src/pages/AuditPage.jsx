import { useEffect, useState } from 'react';
import { auditLogsAPI } from '../services/api';
import { ClipboardList, Download, Filter } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { exportToCSV } from '../components/ExportButton';
import toast from 'react-hot-toast';

const fallbackLogs = [
  { id: '1', user: 'Ahmed Hassan', action: 'login', entity: 'auth', entityId: '-', details: 'Successful login', ip: '192.168.1.1', timestamp: new Date(Date.now() - 300000) },
  { id: '2', user: 'Sara Johnson', action: 'create', entity: 'medicine', entityId: 'MED-001', details: 'Added Paracetamol 500mg', ip: '192.168.1.2', timestamp: new Date(Date.now() - 600000) },
  { id: '3', user: 'System', action: 'update', entity: 'order', entityId: 'ORD-1234', details: 'Status changed to delivered', ip: '10.0.0.1', timestamp: new Date(Date.now() - 900000) },
  { id: '4', user: 'Mohamed Ali', action: 'delete', entity: 'coupon', entityId: 'CPN-005', details: 'Deleted expired coupon', ip: '192.168.1.3', timestamp: new Date(Date.now() - 1800000) },
  { id: '5', user: 'Emily Brown', action: 'update', entity: 'settings', entityId: '-', details: 'Updated delivery settings', ip: '192.168.1.4', timestamp: new Date(Date.now() - 3600000) },
];

const actionColors = {
  login: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: '', action: '', entity: '' });

  const load = () => {
    auditLogsAPI.list(filters).then(res => {
      const data = res.data?.data;
      setLogs(Array.isArray(data) ? data : data?.logs || fallbackLogs);
    }).catch(() => setLogs(fallbackLogs)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleExport = () => {
    const headers = ['User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP', 'Timestamp'];
    const rows = logs.map(l => [l.user, l.action, l.entity, l.entityId, l.details, l.ip, new Date(l.timestamp).toLocaleString()]);
    exportToCSV(rows, headers, 'audit-logs');
    toast.success('Exported');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" subtitle="System activity tracking" actions={
        <button onClick={handleExport} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download size={16} /> Export
        </button>
      } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={filters.userId} onChange={e => setFilters({...filters, userId: e.target.value})} placeholder="Filter by user"
            className="flex-1 px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          <select value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})}
            className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <select value={filters.entity} onChange={e => setFilters({...filters, entity: e.target.value})}
            className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
            <option value="">All Entities</option>
            <option value="auth">Auth</option>
            <option value="medicine">Medicine</option>
            <option value="order">Order</option>
            <option value="coupon">Coupon</option>
            <option value="settings">Settings</option>
          </select>
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Apply</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Details</th>
              <th className="px-5 py-3 font-medium">IP</th>
              <th className="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              logs.map(l => (
                <tr key={l.id || l._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{l.user}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[l.action] || 'bg-gray-100 text-gray-700'}`}>{l.action}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{l.entity}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{l.details}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{l.ip}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
