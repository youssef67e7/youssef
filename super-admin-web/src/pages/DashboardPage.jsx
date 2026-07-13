import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { DollarSign, ShoppingCart, Users, Pill, Building2, Truck, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusIndicator from '../components/StatusIndicator';
import toast from 'react-hot-toast';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];

const fallbackRevenue = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 72000 }, { month: 'Aug', revenue: 69000 },
  { month: 'Sep', revenue: 78000 }, { month: 'Oct', revenue: 82000 },
  { month: 'Nov', revenue: 85000 }, { month: 'Dec', revenue: 91000 },
];

const fallbackRegion = [
  { name: 'North', value: 35 }, { name: 'South', value: 25 },
  { name: 'East', value: 20 }, { name: 'West', value: 15 }, { name: 'Central', value: 5 },
];

const fallbackPharmacies = [
  { name: 'Central', revenue: 345000 }, { name: 'North', revenue: 298000 },
  { name: 'South', revenue: 267000 }, { name: 'East', revenue: 234000 },
  { name: 'West', revenue: 198000 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([dashboardAPI.stats(), dashboardAPI.systemHealth(), dashboardAPI.alerts()])
      .then(([s, h, a]) => {
        if (s.status === 'fulfilled') setStats(s.value.data?.data || s.value.data);
        if (h.status === 'fulfilled') setHealth(h.value.data?.data || h.value.data);
        if (a.status === 'fulfilled') setAlerts(a.value.data?.data || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const revenueData = stats?.revenueTrend || fallbackRevenue;
  const regionData = stats?.ordersByRegion || fallbackRegion;
  const topPharmacies = stats?.topPharmacies || fallbackPharmacies;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="System-wide overview" actions={
        <div className="flex items-center gap-2">
          <StatusIndicator status={health?.api?.status || 'healthy'} size="lg" />
        </div>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 1245000).toLocaleString()}`} icon={DollarSign} color="bg-green-500" change="+12.5%" />
        <StatCard title="Total Orders" value={(stats?.totalOrders || 45230).toLocaleString()} icon={ShoppingCart} color="bg-blue-500" change="+8.2%" />
        <StatCard title="Total Users" value={(stats?.totalUsers || 98500).toLocaleString()} icon={Users} color="bg-orange-500" change="+5.1%" />
        <StatCard title="Medicines" value={(stats?.totalMedicines || 15200).toLocaleString()} icon={Pill} color="bg-purple-500" />
        <StatCard title="Pharmacies" value={stats?.totalPharmacies || 6} icon={Building2} color="bg-pink-500" />
        <StatCard title="Active Drivers" value={stats?.activeDrivers || 124} icon={Truck} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ChartCard title="Revenue Trends" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Orders by Region" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={regionData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Pharmacies">
          {topPharmacies.map((p, i) => {
            const maxRev = topPharmacies[0]?.revenue || 1;
            return (
              <div key={i} className="flex items-center gap-3 py-2">
                <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                <span className="text-sm font-medium w-24 truncate dark:text-white">{p.name}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold w-20 text-right dark:text-white">${p.revenue?.toLocaleString()}</span>
              </div>
            );
          })}
        </ChartCard>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold dark:text-white">System Alerts</h3>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length || 3}</span>
          </div>
          <div className="space-y-3">
            {(alerts.length ? alerts : [
              { type: 'warning', message: 'High memory usage on server', time: '2 min ago' },
              { type: 'error', message: 'Payment gateway timeout', time: '15 min ago' },
              { type: 'info', message: 'Scheduled maintenance tonight', time: '1 hour ago' },
            ]).map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm dark:text-gray-200">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
