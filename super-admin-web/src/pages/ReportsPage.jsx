import { useState } from 'react';
import { reportsAPI } from '../services/api';
import {
  FileText, Download, RefreshCw, Calendar, FileSpreadsheet,
  Loader2, TrendingUp, Users, Package, ShoppingCart
} from 'lucide-react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const reportTypes = [
  { value: 'revenue', label: 'Revenue Report', icon: TrendingUp, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  { value: 'users', label: 'User Growth Analysis', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { value: 'inventory', label: 'Inventory Report', icon: Package, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  { value: 'sales', label: 'Medicine Sales Summary', icon: ShoppingCart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
];

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

function getDateRange(dates) {
  const now = new Date();
  const days = dates === '7d' ? 7 : dates === '30d' ? 30 : dates === '90d' ? 90 : 365;
  return {
    start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
    end: now,
  };
}

export default function ReportsPage() {
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ type: 'revenue', dateRange: '30d', format: 'pdf' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setLoading(true);
    try {
      const res = await reportsAPI.generate(form);
      const data = res.data?.data || res.data;
      setResult({ type: form.type, dateRange: form.dateRange, data, generatedAt: new Date().toISOString() });
      toast.success('Report generated');
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { start, end } = getDateRange(result?.dateRange || '30d');
      const res = await reportsAPI.export(start.toISOString(), end.toISOString());
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${result?.type || 'sales'}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const renderResult = () => {
    if (!result) return null;
    const d = result.data;
    if (!d) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold dark:text-white">{reportTypes.find(t => t.value === result.type)?.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dateRanges.find(r => r.value === result.dateRange)?.label} · Generated {new Date(result.generatedAt).toLocaleString()}</p>
            </div>
            <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {d.message && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{d.message}</p>}

          {d.data?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(d.data.summary).map(([key, val]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-lg font-semibold dark:text-white">
                    {typeof val === 'number' ? (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('total') ? `$${val.toLocaleString()}` : val.toLocaleString()) : val ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {d.data?.orders?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {Object.keys(d.data.orders[0]).slice(0, 6).map(k => (
                      <th key={k} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {d.data.orders.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {Object.values(row).slice(0, 6).map((val, j) => (
                        <td key={j} className="px-4 py-2 dark:text-gray-300">{typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {d.data?.categories?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {Object.keys(d.data.categories[0]).slice(0, 5).map(k => (
                      <th key={k} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {d.data.categories.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {Object.values(row).slice(0, 5).map((val, j) => (
                        <td key={j} className="px-4 py-2 dark:text-gray-300">{typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {d.data?.roles?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {Object.keys(d.data.roles[0]).map(k => (
                      <th key={k} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {d.data.roles.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-2 dark:text-gray-300">{typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {d.data?.lowStockItems?.length > 0 && (
            <div>
              <h4 className="font-medium dark:text-white mb-2 text-sm">Low Stock Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {Object.keys(d.data.lowStockItems[0]).slice(0, 5).map(k => (
                        <th key={k} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {d.data.lowStockItems.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {Object.values(row).slice(0, 5).map((val, j) => (
                          <td key={j} className="px-4 py-2 dark:text-gray-300">{typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export reports"
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
            <RefreshCw size={16} /> Generate Report
          </button>
        }
      />

      {!result && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((rt) => {
            const Icon = rt.icon;
            return (
              <button key={rt.value} onClick={() => { setForm({ ...form, type: rt.value }); setShowForm(true); }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 text-left hover:border-primary-400 dark:hover:border-primary-600 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${rt.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-medium dark:text-white">{rt.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to generate</p>
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-12 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-primary-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Generating report...</p>
        </div>
      )}

      {renderResult()}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Generate New Report" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Report Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
              {reportTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Date Range</label>
            <select value={form.dateRange} onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none">
              {dateRanges.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">Cancel</button>
            <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
              {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><RefreshCw size={16} /> Generate Report</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
