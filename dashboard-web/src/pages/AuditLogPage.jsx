import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, Activity, Calendar, User, FileText } from 'lucide-react';
import { auditLogAPI } from '../services/api';
import PageHeader from '../components/PageHeader';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'user', label: 'User' },
  { value: 'order', label: 'Order' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'category', label: 'Category' },
  { value: 'customer', label: 'Customer' },
  { value: 'driver', label: 'Driver' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'banner', label: 'Banner' },
  { value: 'review', label: 'Review' },
  { value: 'settings', label: 'Settings' },
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ user: '', action: '', entity: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (filters.user) params.user = filters.user;
      if (filters.action) params.action = filters.action;
      if (filters.entity) params.entity = filters.entity;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const res = await auditLogAPI.list(params);
      const data = res.data?.data || res.data || {};
      setLogs(Array.isArray(data.data || data.logs || data) ? (data.data || data.logs || data) : []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {
      toast.error('Failed to load audit logs');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters.action, filters.entity, page]);

  const handleSearch = () => {
    setPage(1);
    load();
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'login': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'approve': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'reject': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Track all system activities"
        breadcrumbs={['Dashboard', 'Audit Log']}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">User</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.user}
                onChange={e => setFilters({ ...filters, user: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-8 pr-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Filter by user..."
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              {ACTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entity</label>
            <select
              value={filters.entity}
              onChange={e => setFilters({ ...filters, entity: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              {ENTITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">User</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Action</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Entity</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Entity ID</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Details</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">IP Address</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Activity size={48} className="mx-auto mb-2 opacity-50" />
                  No audit log entries found
                </td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id || log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 font-medium dark:text-white whitespace-nowrap">
                      {log.user?.name || log.userName || log.performedBy || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getActionColor(log.action)}`}>
                        {log.action || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 capitalize">
                      {log.entity || log.entityType || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">
                      {log.entityId ? String(log.entityId).slice(-8) : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {log.details || log.description || log.metadata ? (
                        <span title={typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || log.description)}>
                          {typeof log.details === 'object'
                            ? JSON.stringify(log.details).slice(0, 50) + '...'
                            : String(log.details || log.description).slice(0, 50)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">
                      {log.ipAddress || log.ip || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
