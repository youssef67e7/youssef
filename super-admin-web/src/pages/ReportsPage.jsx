import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import {
  FileText, Download, Trash2, Plus, RefreshCw,
  Calendar, FileSpreadsheet, Loader2, Clock, CheckCircle2
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const reportTypes = [
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'users', label: 'User Growth Analysis' },
  { value: 'branch', label: 'Branch Performance' },
  { value: 'sales', label: 'Medicine Sales Summary' },
  { value: 'orders', label: 'Order Analytics' },
];

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

const statusMap = {
  completed: { label: 'Completed', variant: 'completed' },
  processing: { label: 'Processing', variant: 'processing' },
  pending: { label: 'Pending', variant: 'pending' },
  failed: { label: 'Failed', variant: 'failed' },
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ type: 'revenue', dateRange: '30d', format: 'pdf' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.list();
      const data = res.data?.data;
      setReports(Array.isArray(data) ? data : data?.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!form.type) {
      setFormErrors({ type: 'Please select a report type' });
      return;
    }
    setFormErrors({});
    setGenerating(true);
    try {
      await reportsAPI.generate(form);
      toast.success('Report generation started');
      setShowForm(false);
      setForm({ type: 'revenue', dateRange: '30d', format: 'pdf' });
      load();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id, format) => {
    setDownloading(`${id}-${format}`);
    try {
      const res = await reportsAPI.export(id, format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await reportsAPI.delete(deleteTarget.id || deleteTarget._id);
      toast.success('Report deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete report');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Report',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{row.type} report</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
          {val}
        </span>
      ),
    },
    {
      key: 'date', label: 'Generated',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={13} />
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const s = statusMap[val] || { label: val, variant: val };
        return <StatusBadge status={s.variant} label={s.label} />;
      },
    },
    {
      key: 'actions', label: 'Actions', width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDownload(row.id || row._id, 'pdf')}
            disabled={downloading === `${row.id || row._id}-pdf`}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-blue-500 disabled:opacity-40"
            title="Download PDF"
          >
            {downloading === `${row.id || row._id}-pdf` ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
          <button
            onClick={() => handleDownload(row.id || row._id, 'excel')}
            disabled={downloading === `${row.id || row._id}-excel`}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-green-500 disabled:opacity-40"
            title="Download Excel"
          >
            {downloading === `${row.id || row._id}-excel` ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-red-500"
            title="Delete report"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle={`${reports.length} reports generated`}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} />
            Generate Report
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        emptyIcon={FileText}
        emptyTitle="No reports yet"
        emptyDescription="Generate your first report to get started with analytics."
        emptyAction={{
          label: 'Generate Report',
          onClick: () => setShowForm(true),
        }}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Generate New Report" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Report Type *</label>
            <select
              value={form.type}
              onChange={(e) => { setForm({ ...form, type: e.target.value }); setFormErrors({}); }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none ${
                formErrors.type ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {reportTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Date Range</label>
            <select
              value={form.dateRange}
              onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none"
            >
              {dateRanges.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText, color: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
                { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
                { value: 'csv', label: 'CSV', icon: FileSpreadsheet, color: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setForm({ ...form, format: f.value })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition ${
                    form.format === f.value
                      ? `${f.color} border-current`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <f.icon size={18} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        confirmText={deleteLoading ? 'Deleting...' : 'Delete Report'}
        confirmVariant="danger"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
