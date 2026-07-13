import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import { FileText, Download, Trash2, Plus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const fallbackReports = [
  { id: '1', name: 'Monthly Revenue Report', type: 'revenue', date: '2024-01-15', status: 'completed' },
  { id: '2', name: 'User Growth Analysis', type: 'users', date: '2024-01-14', status: 'completed' },
  { id: '3', name: 'Branch Performance Q4', type: 'branch', date: '2024-01-10', status: 'completed' },
  { id: '4', name: 'Medicine Sales Summary', type: 'sales', date: '2024-01-08', status: 'completed' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ type: 'revenue', dateRange: '30d', format: 'pdf' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    reportsAPI.list().then(res => {
      const data = res.data?.data;
      setReports(Array.isArray(data) ? data : data?.reports || fallbackReports);
    }).catch(() => setReports(fallbackReports)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportsAPI.generate(form);
      toast.success('Report generated');
      setShowForm(false); load();
    } catch { toast.error('Failed to generate'); }
    setGenerating(false);
  };

  const handleDownload = async (id, format) => {
    try {
      const res = await reportsAPI.export(id, format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `report-${id}.${format}`; a.click();
      toast.success('Downloaded');
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async () => {
    try { await reportsAPI.delete(deleteTarget.id || deleteTarget._id); toast.success('Deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" subtitle={`${reports.length} reports`} actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
          <Plus size={16} /> Generate Report
        </button>
      } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <h3 className="font-semibold mb-3 dark:text-white">Generate New Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
              <option value="revenue">Revenue Report</option>
              <option value="users">User Report</option>
              <option value="branch">Branch Performance</option>
              <option value="sales">Medicine Sales</option>
            </select>
            <select value={form.dateRange} onChange={e => setForm({...form, dateRange: e.target.value})}
              className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select value={form.format} onChange={e => setForm({...form, format: e.target.value})}
              className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleGenerate} disabled={generating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Report</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              reports.map(r => (
                <tr key={r.id || r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2"><FileText size={16} className="text-gray-400" /><span className="font-medium dark:text-white">{r.name}</span></div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{r.type}</td>
                  <td className="px-5 py-3 text-gray-500">{r.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDownload(r.id || r._id, 'pdf')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Download PDF">
                        <Download size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => handleDownload(r.id || r._id, 'excel')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Download Excel">
                        <Download size={16} className="text-green-500" />
                      </button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Report" confirmText="Delete"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
