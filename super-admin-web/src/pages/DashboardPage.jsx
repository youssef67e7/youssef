import { useEffect, useState } from 'react';
import { dashboardAPI, systemHealthAPI, auditLogsAPI, usersAPI } from '../services/api';
import {
  Building2, Users, DollarSign, ShoppingCart,
  Activity, CheckCircle2, Clock,
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

const activityIcons = {
  CREATE: CheckCircle2, UPDATE: Activity, DELETE: AlertTriangle,
  LOGIN: Activity, LOGOUT: Activity, default: Activity,
};

const activityColors = {
  CREATE: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  UPDATE: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  DELETE: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  LOGIN: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  LOGOUT: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  default: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30',
};

const healthIcons = { database: Database, memory: Server, disk: Server, overall: Activity };

function timeAgo(date) {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pharmacyCount, setPharmacyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [s, h, logs, pharmacies] = await Promise.allSettled([
          dashboardAPI.stats(),
          systemHealthAPI.overview(),
          auditLogsAPI.list({ limit: 10 }),
          usersAPI.list({ role: 'ADMIN', limit: 100 }),
        ]);

        if (s.status === 'fulfilled') {
          const d = s.value.data?.data || s.value.data;
          setStats(d);
        }
        if (h.status === 'fulfilled') {
          const d = h.value.data?.data || h.value.data;
          setHealth(d);
        }
        if (logs.status === 'fulfilled') {
          const d = logs.value.data?.data || logs.value.data;
          setAuditLogs(Array.isArray(d) ? d.slice(0, 8) : []);
        }
        if (pharmacies.status === 'fulfilled') {
          const d = pharmacies.value.data?.data || pharmacies.value.data;
          setPharmacyCount(Array.isArray(d) ? d.length : 0);
        }
      } catch {
        // errors handled per-settled
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const totalUsers = stats?.users?.total ?? 0;
  const totalRevenue = stats?.revenue?.total ?? 0;
  const totalOrders = stats?.orders?.total ?? 0;
  const todayOrders = stats?.orders?.today ?? 0;
  const lowStock = stats?.medicines?.lowStock ?? 0;

  const healthServices = (() => {
    if (Array.isArray(health?.services)) return health.services;
    if (health?.services && typeof health.services === 'object') {
      return Object.entries(health.services).map(([name, info]) => ({
        name,
        status: info?.status === 'ok' ? 'healthy' : (info?.status || 'unknown'),
        message: info?.message || '',
      }));
    }
    return [];
  })();

  const apiStatus = health?.status === 'ok' ? 'healthy' : 'degraded';

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
          value={pharmacyCount.toLocaleString()}
          icon={Building2}
          color="primary"
        />
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="System Health" height={320}>
            <div className="space-y-4 p-2">
              {healthServices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No health data available</p>
              ) : healthServices.map((service, i) => {
                const IconComp = healthIcons[service.name] || healthIcons.overall;
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
                        <p className="text-sm font-medium dark:text-white capitalize">{service.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{service.message || 'Operational'}</p>
                      </div>
                    </div>
                    <StatusIndicator status={service.status} />
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold dark:text-white">Quick Stats</h3>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Today Orders', value: todayOrders, color: 'text-blue-600' },
              { label: 'Low Stock Items', value: lowStock, color: lowStock > 0 ? 'text-red-600' : 'text-green-600' },
              { label: 'Active Pharmacies', value: pharmacyCount, color: 'text-purple-600' },
              { label: 'Total Users', value: totalUsers, color: 'text-indigo-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Recent Activity</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">From audit log</span>
        </div>
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
          ) : auditLogs.map((log) => {
            const actionType = (log.action || '').split('_')[0] || 'default';
            const IconComp = activityIcons[actionType] || activityIcons.default;
            const colorClass = activityColors[actionType] || activityColors.default;
            const actionText = (log.action || '').replace(/_/g, ' ').toLowerCase();
            return (
              <div key={log._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComp size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm dark:text-gray-200">
                    <span className="font-medium dark:text-white">{log.user?.name || 'System'}</span>
                    {' '}{actionText} on {log.entity || 'unknown'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {timeAgo(log.createdAt)}
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
