import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { DollarSign, ShoppingCart, Users, Pill, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const fallbackData = [
  { name: 'Jan', orders: 40, revenue: 2400 },
  { name: 'Feb', orders: 30, revenue: 1398 },
  { name: 'Mar', orders: 20, revenue: 9800 },
  { name: 'Apr', orders: 27, revenue: 3908 },
  { name: 'May', orders: 18, revenue: 4800 },
  { name: 'Jun', orders: 23, revenue: 3800 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [ordersData, setOrdersData] = useState(fallbackData);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersChartRes, recentRes, alertsRes] = await Promise.allSettled([
          dashboardAPI.stats(),
          dashboardAPI.ordersChart().catch(() => null),
          dashboardAPI.recentOrders({ limit: 5 }).catch(() => null),
          dashboardAPI.inventoryAlerts().catch(() => null),
        ]);

        if (statsRes.status === 'fulfilled') {
          const d = statsRes.value.data?.data || statsRes.value.data;
          setStats(d);
        }

        if (ordersChartRes.status === 'fulfilled' && ordersChartRes.value) {
          const d = ordersChartRes.value.data?.data || ordersChartRes.value.data;
          if (Array.isArray(d) && d.length > 0) setOrdersData(d);
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

  const statCards = [
    { title: 'Total Revenue', value: stats?.totalRevenue != null ? `$${Number(stats.totalRevenue).toLocaleString()}` : '—', icon: DollarSign, color: 'bg-green-500', change: stats?.revenueChange, isPositive: stats?.revenueChangePositive !== false },
    { title: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingCart, color: 'bg-blue-500', change: stats?.ordersChange, isPositive: stats?.ordersChangePositive !== false },
    { title: 'Total Customers', value: stats?.totalCustomers ?? stats?.totalUsers ?? '—', icon: Users, color: 'bg-purple-500', change: stats?.customersChange, isPositive: stats?.customersChangePositive !== false },
    { title: 'Total Medicines', value: stats?.totalMedicines ?? '—', icon: Pill, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your pharmacy overview." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <StatCard key={card.title} title={card.title} value={loading ? '...' : card.value} icon={card.icon} color={card.color} change={card.change} isPositive={card.isPositive} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Orders Overview" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="orders" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Inventory Alerts
            </h3>
            {inventoryAlerts.length === 0 ? (
              <p className="text-sm text-gray-400">No alerts</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inventoryAlerts.map((alert, i) => (
                  <div key={alert._id || i} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-sm dark:text-gray-300">{alert.name || alert.medicineName || `Item ${i + 1}`}</span>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Stock: {alert.stockQuantity ?? alert.stock ?? 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
        <h3 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Recent Orders
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <tr>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No recent orders</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order._id || order.id}>
                  <td className="py-3 font-medium dark:text-white">{order.orderNumber || order._id?.slice(-8) || '—'}</td>
                  <td className="py-3 dark:text-gray-300">{order.customer?.name || order.user?.name || '—'}</td>
                  <td className="py-3 dark:text-white font-medium">${order.totalAmount || order.total || 0}</td>
                  <td className="py-3"><StatusBadge status={order.status} /></td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
