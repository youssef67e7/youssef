import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { ShoppingCart, Clock, AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

const fallbackData = [
  { name: 'Mon', orders: 12 }, { name: 'Tue', orders: 19 },
  { name: 'Wed', orders: 15 }, { name: 'Thu', orders: 22 },
  { name: 'Fri', orders: 18 }, { name: 'Sat', orders: 28 }, { name: 'Sun', orders: 20 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(fallbackData);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [statsRes, chartRes, recentRes, alertsRes] = await Promise.allSettled([
          dashboardAPI.stats(),
          dashboardAPI.ordersChart().catch(() => null),
          dashboardAPI.recentOrders({ limit: 5 }).catch(() => null),
          dashboardAPI.inventoryAlerts().catch(() => null),
        ]);

        if (statsRes.status === 'fulfilled') {
          const d = statsRes.value.data?.data || statsRes.value.data;
          setStats(d);
        }
        if (chartRes.status === 'fulfilled' && chartRes.value) {
          const d = chartRes.value.data?.data || chartRes.value.data;
          if (Array.isArray(d) && d.length > 0) setChartData(d);
        }
        if (recentRes.status === 'fulfilled' && recentRes.value) {
          const d = recentRes.value.data?.data || recentRes.value.data;
          setRecentOrders(Array.isArray(d) ? d : []);
        }
        if (alertsRes.status === 'fulfilled' && alertsRes.value) {
          const d = alertsRes.value.data?.data || alertsRes.value.data;
          setInventoryAlerts(Array.isArray(d) ? d : []);
        }
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const orderColumns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => (
      <span className="font-medium dark:text-white">{v || row._id?.slice(-8) || '—'}</span>
    )},
    { key: 'customer', label: 'Customer', render: (v, row) => (
      <span className="dark:text-gray-300">{v?.name || row.user?.name || '—'}</span>
    )},
    { key: 'totalAmount', label: 'Total', render: (v, row) => (
      <span className="font-medium dark:text-white">${v || row.total || 0}</span>
    )},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => (
      <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? new Date(v).toLocaleDateString() : '—'}</span>
    )},
  ];

  const lowStockCount = inventoryAlerts.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your pharmacy overview." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={loading ? '...' : (stats?.todayOrders ?? stats?.totalOrders ?? '—')}
          icon={ShoppingCart}
          color="blue"
          change={stats?.ordersChange}
        />
        <StatCard
          title="Pending Orders"
          value={loading ? '...' : (stats?.pendingOrders ?? '—')}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Low Stock Items"
          value={loading ? '...' : lowStockCount}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Revenue"
          value={loading ? '...' : (stats?.totalRevenue != null ? `$${Number(stats.totalRevenue).toLocaleString()}` : '—')}
          icon={DollarSign}
          color="green"
          change={stats?.revenueChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Orders Overview" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
                  wrapperClassName="dark:!bg-gray-800 dark:!border-gray-700"
                />
                <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Low Stock Alerts
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : inventoryAlerts.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">All stock levels healthy</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inventoryAlerts.map((alert, i) => (
                <div key={alert._id || i} className="flex items-center justify-between p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={14} className="text-orange-500 shrink-0" />
                    <span className="text-sm dark:text-gray-300 truncate">{alert.name || alert.medicineName || `Item ${i + 1}`}</span>
                  </div>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium shrink-0 ml-2">
                    Stock: {alert.stockQuantity ?? alert.stock ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
        <h3 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Recent Orders
        </h3>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          loading={loading}
          emptyIcon={ShoppingCart}
          emptyTitle="No recent orders"
          emptyDescription="Orders will appear here once customers start placing them."
        />
      </div>
    </div>
  );
}
