import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Download, Calendar, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { LineChart, PieChart, BarChart, ResponsiveContainer, Line, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { analyticsAPI, dashboardAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import { exportToCSV } from '../components/ExportButton';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [revenue, setRevenue] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const [revRes, orderRes, custRes, medRes] = await Promise.allSettled([
        analyticsAPI.revenue(params),
        analyticsAPI.orders(params),
        analyticsAPI.customers(params),
        dashboardAPI.topMedicines(params),
      ]);

      if (revRes.status === 'fulfilled') {
        const data = revRes.value.data?.data || revRes.value.data || {};
        setRevenue(Array.isArray(data.chart || data.revenue) ? (data.chart || data.revenue) : []);
        setSummary(prev => ({ ...prev, totalRevenue: data.totalRevenue || data.total || 0, avgOrderValue: data.avgOrderValue || 0 }));
      }
      if (orderRes.status === 'fulfilled') {
        const data = orderRes.value.data?.data || orderRes.value.data || {};
        const dist = data.distribution || data.statusDistribution || data;
        setOrderStatus(Array.isArray(dist) ? dist : []);
        setSummary(prev => ({ ...prev, totalOrders: data.totalOrders || data.total || 0 }));
      }
      if (custRes.status === 'fulfilled') {
        const data = custRes.value.data?.data || custRes.value.data || {};
        setCustomerGrowth(Array.isArray(data.chart || data.growth) ? (data.chart || data.growth) : []);
        setSummary(prev => ({ ...prev, totalCustomers: data.totalCustomers || data.total || 0 }));
      }
      if (medRes.status === 'fulfilled') {
        const data = medRes.value.data?.data || medRes.value.data || [];
        setTopMedicines(Array.isArray(data) ? data : (data.medicines || []));
      }
    } catch {
      toast.error('Failed to load analytics');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleExport = () => {
    if (revenue.length > 0) {
      exportToCSV(
        revenue.map(r => [r.date || r.period || r.label, r.amount || r.revenue || r.total, r.orders || 0]),
        ['Date', 'Revenue', 'Orders'],
        'revenue-analytics'
      );
      toast.success('Revenue data exported');
    }
  };

  const formatCurrency = (val) => {
    return `$${Number(val || 0).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Business performance insights"
        breadcrumbs={['Dashboard', 'Analytics']}
        actions={
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <label className="text-sm text-gray-600 dark:text-gray-400">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{summary.totalOrders.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <ShoppingBag size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{summary.totalCustomers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  <Users size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(summary.avgOrderValue)}</p>
                </div>
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Revenue Trend" height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Orders by Status" height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Customer Growth" height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="New Customers" />
                  <Bar dataKey="customers" fill="#10b981" radius={[4, 4, 0, 0]} name="New Customers" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Medicines" height={300}>
              <div className="overflow-auto h-full">
                {topMedicines.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No data available
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                        <th className="pb-2 font-medium">#</th>
                        <th className="pb-2 font-medium">Medicine</th>
                        <th className="pb-2 font-medium text-right">Sales</th>
                        <th className="pb-2 font-medium text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {topMedicines.slice(0, 8).map((m, i) => (
                        <tr key={m._id || m.id || i}>
                          <td className="py-2 text-gray-500 dark:text-gray-400">{i + 1}</td>
                          <td className="py-2 font-medium dark:text-white">{m.name || m.medicine?.name || '—'}</td>
                          <td className="py-2 text-right text-gray-500 dark:text-gray-400">{m.totalSold || m.sales || 0}</td>
                          <td className="py-2 text-right font-medium dark:text-white">{formatCurrency(m.totalRevenue || m.revenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

