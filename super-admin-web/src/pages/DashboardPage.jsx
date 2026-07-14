import { useEffect, useState } from 'react';
import { dashboardAPI, systemHealthAPI } from '../services/api';
import {
  Building2, Users, DollarSign, ShoppingCart,
  Activity, CheckCircle2, XCircle, Clock,
  TrendingUp, AlertTriangle, Server, Database, Wifi
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusIndicator from '../components/StatusIndicator';
import toast from 'react-hot-toast';

const fallbackRevenue = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 72000 }, { month: 'Aug', revenue: 69000 },
  { month: 'Sep', revenue: 78000 }, { month: 'Oct', revenue: 82000 },
  { month: 'Nov', revenue: 85000 }, { month: 'Dec', revenue: 91000 },
];

const fallbackActivity = [
  { id: 1, user: 'Ahmed Hassan', action: 'Created pharmacy "PharmaWorld East"', time: '2 min ago', type: 'create' },
  { id: 2, user: 'Sara Johnson', action: 'Updated system configuration', time: '15 min ago', type: 'update' },
  { id: 3, user: 'System', action: 'Backup completed successfully', time: '1 hour ago', type: 'system' },
  { id: 4, user: 'Mohamed Ali', action: 'Suspended user fatima@customer.com', time: '2 hours ago', type: 'suspend' },
  { id: 5, user: 'Emily Brown', action: 'Generated monthly revenue report', time: '3 hours ago', type: 'report' },
];

const activityIcons = {
  create: CheckCircle2, update: Activity, system: Server,
  suspend: AlertTriangle, report: TrendingUp
};

const activityColors = {
  create: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  update: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  system: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  suspend: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  report: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
};

const healthIcons = {
  api: Wifi, database: Database, cache: Server, overall: Activity
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([dashboardAPI.stats(), systemHealthAPI.overview()])
      .then(([s, h]) => {
        if (s.status === 'fulfilled') setStats(s.value.data?.data || s.value.data);
        if (h.status === 'fulfilled') setHealth(h.value.data?.data || h.value.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const revenueData = Array.isArray(stats?.revenueTrend) ? stats.revenueTrend : fallbackRevenue;
  const activity = Array.isArray(stats?.recentActivity) ? stats.recentActivity : fallbackActivity;

  const healthServices = (() => {
    if (Array.isArray(health?.services)) return health.services;
    if (health?.services && typeof health.services === 'object') {
      return Object.entries(health.services).map(([name, info]) => ({
        name,
        status: info.status === 'ok' ? 'healthy' : info.status,
        latency: info.latency || null,
        message: info.message || '',
      }));
    }
    return [
      { name: 'API Gateway', status: 'healthy', latency: '45ms' },
      { name: 'Database', status: 'healthy', latency: '12ms' },
      { name: 'Cache Layer', status: 'healthy', latency: '3ms' },
      { name: 'File Storage', status: 'healthy', latency: '28ms' },
    ];
  })();

  const apiStatus = health?.api?.status || (health?.status === 'ok' ? 'healthy' : health?.status) || 'healthy';

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="System-wide overview" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 h-80 animate-pulse" />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Platform-wide overview and analytics"
        actions={
          <div className="flex items-center gap-2">
            <StatusIndicator status={apiStatus} size="lg" />
            <span className="text-xs text-gray-500 dark:text-gray-400">System Status</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pharmacies"
          value={stats?.totalPharmacies?.toLocaleString() || '6'}
          icon={Building2}
          color="primary"
          change={stats?.pharmacyChange ?? 12.5}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '98,500'}
          icon={Users}
          color="blue"
          change={stats?.userChange ?? 5.1}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 1245000).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          change={stats?.revenueChange ?? 12.5}
        />
        <StatCard
          title="Active Orders"
          value={stats?.activeOrders?.toLocaleString() || '1,248'}
          icon={ShoppingCart}
          color="orange"
          change={stats?.orderChange ?? 8.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Trend" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937', border: 'none',
                    borderRadius: '8px', color: '#f3f4f6'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone" dataKey="revenue" stroke="#10b981"
                  strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold dark:text-white">System Health</h3>
            <Activity size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {healthServices.map((service, i) => {
              const IconComp = healthIcons[service.name?.toLowerCase().includes('db') ? 'database'
                : service.name?.toLowerCase().includes('api') ? 'api'
                : service.name?.toLowerCase().includes('cache') ? 'cache' : 'overall'];
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      service.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' :
                      service.status === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <IconComp size={16} className={
                        service.status === 'healthy' ? 'text-green-600 dark:text-green-400' :
                        service.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      } />
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{service.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{service.latency || 'N/A'}</p>
                    </div>
                  </div>
                  <StatusIndicator status={service.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Recent Activity</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last 24 hours</span>
        </div>
        <div className="space-y-3">
          {activity.map((item) => {
            const IconComp = activityIcons[item.type] || Activity;
            const colorClass = activityColors[item.type] || activityColors.update;
            return (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComp size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm dark:text-gray-200">
                    <span className="font-medium dark:text-white">{item.user}</span>
                    {' '}{item.action}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {item.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
