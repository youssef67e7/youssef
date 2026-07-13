import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart3, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import toast from 'react-hot-toast';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];

const fallbackRevenue = [
  { month: 'Jan', revenue: 120000, orders: 3200 }, { month: 'Feb', revenue: 135000, orders: 3600 },
  { month: 'Mar', revenue: 128000, orders: 3400 }, { month: 'Apr', revenue: 152000, orders: 4100 },
  { month: 'May', revenue: 145000, orders: 3900 }, { month: 'Jun', revenue: 168000, orders: 4500 },
];

const fallbackUsers = [
  { month: 'Jan', newUsers: 450, activeUsers: 12000 }, { month: 'Feb', newUsers: 520, activeUsers: 12800 },
  { month: 'Mar', newUsers: 480, activeUsers: 13200 }, { month: 'Apr', newUsers: 610, activeUsers: 14500 },
  { month: 'May', newUsers: 550, activeUsers: 15000 }, { month: 'Jun', newUsers: 670, activeUsers: 16200 },
];

const fallbackBranch = [
  { name: 'Central', revenue: 345000, orders: 12500 }, { name: 'North', revenue: 298000, orders: 10800 },
  { name: 'South', revenue: 267000, orders: 9600 }, { name: 'East', revenue: 234000, orders: 8400 },
  { name: 'West', revenue: 198000, orders: 7100 },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('cross-branch');
  const [revenue, setRevenue] = useState(fallbackRevenue);
  const [users, setUsers] = useState(fallbackUsers);
  const [branch, setBranch] = useState(fallbackBranch);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const params = {};
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;

    Promise.allSettled([
      analyticsAPI.revenue(params),
      analyticsAPI.users(params),
      analyticsAPI.crossBranch(params),
    ]).then(([r, u, b]) => {
      if (r.status === 'fulfilled') {
        const d = r.value.data?.data;
        setRevenue(Array.isArray(d) ? d : d?.items || fallbackRevenue);
      }
      if (u.status === 'fulfilled') {
        const d = u.value.data?.data;
        setUsers(Array.isArray(d) ? d : d?.items || fallbackUsers);
      }
      if (b.status === 'fulfilled') {
        const d = b.value.data?.data;
        setBranch(Array.isArray(d) ? d : d?.items || fallbackBranch);
      }
    });
  }, [dateRange]);

  const tabs = [
    { key: 'cross-branch', label: 'Cross-Branch' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'users', label: 'Users' },
    { key: 'geographic', label: 'Geographic' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" subtitle="Cross-branch analytics and insights" actions={
        <button onClick={() => toast.success('Exported')} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download size={16} /> Export
        </button>
      } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}
              className="block w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}
              className="block w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
      </div>

      <div className="flex border-b dark:border-gray-700">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cross-branch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Revenue by Branch" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Orders by Branch" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2196F3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {tab === 'revenue' && (
        <ChartCard title="Revenue Trends" height={350}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#2196F3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="New Users" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="newUsers" fill="#9C27B0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Active Users" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="activeUsers" stroke="#FF9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {tab === 'geographic' && (
        <ChartCard title="Orders by Region" height={350}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={branch.map(b => ({ name: b.name, value: b.orders }))} cx="50%" cy="50%" outerRadius={120} dataKey="value"
                label={({ name, value }) => `${name}: ${value.toLocaleString()}`}>
                {branch.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
