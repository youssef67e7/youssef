import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, Trash2, Plus, RefreshCw, X, Filter } from 'lucide-react';
import { reportsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report' },
  { value: 'orders', label: 'Orders Report' },
  { value: 'customers', label: 'Customers Report' },
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'products', label: 'Products Report' },
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

const emptyForm = { type: 'sales', dateFrom: '', dateTo: '', format: 'csv' };

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.list();
      const items = res.data?.data || res.data || [];
      const list = items?.data || items;
      setReports(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load reports');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const data = { type: form.type, format: form.format };
      if (form.dateFrom) data.dateFrom = form.dateFrom;
      if (form.dateTo) data.dateTo = form.dateTo;
      await reportsAPI.generate(data);
      toast.success('Report generation started');
      setShowForm(false);
      setForm(emptyForm);
      setTimeout(load, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    }
    setGenerating(false);
  };

  const handleDownload = async (report) => {
    const id = report._id || report.id;
    setDownloadingId(id);
    try {
      const res = await reportsAPI.download(id);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name || report.type || 'report'}.${report.format || 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download');
    }
    setDownloadingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await reportsAPI.delete(deleteId);
      toast.success('Report deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and download reports"
        breadcrumbs={['Dashboard', 'Reports']}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            <Plus size={16} /> Generate Report
          </button>
        }
      />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold dark:text-white">Generate New Report</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                {REPORT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date From</label>
              <input
                type="date"
                value={form.dateFrom}
                onChange={e => setForm({ ...form, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date To</label>
              <input
                type="date"
                value={form.dateTo}
                onChange={e => setForm({ ...form, dateTo: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
              <select
                value={form.format}
                onChange={e => setForm({ ...form, format: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                {FORMAT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 lg:col-span-4">
              <button type="submit" disabled={generating} className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Type</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                Loading...
              </td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                No reports yet. Generate your first report above.
              </td></tr>
            ) : (
              reports.map(r => (
                <tr key={r._id || r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-medium dark:text-white">
                    {r.name || `${(r.type || 'report').replace(/_/g, ' ')} Report`}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                      {r.type || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status || 'pending'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {(r.status === 'completed' || r.status === 'ready' || r.status === 'done') && (
                        <button
                          onClick={() => handleDownload(r)}
                          disabled={downloadingId === (r._id || r.id)}
                          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      {r.status === 'generating' && (
                        <RefreshCw size={16} className="text-amber-500 animate-spin" />
                      )}
                      <button
                        onClick={() => setDeleteId(r._id || r.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={16} />
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
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report?"
        confirmText="Delete"
      />
    </div>
  );
}
