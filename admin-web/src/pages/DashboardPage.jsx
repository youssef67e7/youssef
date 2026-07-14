import { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import { dashboardAPI, healthAPI } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await dashboardAPI.stats();
        setStats(data.data || data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const checkHealth = async () => {
      try {
        await healthAPI.check();
        setApiStatus('healthy');
      } catch {
        setApiStatus('down');
      }
    };

    fetchDashboard();
    checkHealth();
  }, []);

  const statCards = [
    { title: 'Total Medicines', value: stats?.medicines?.total ?? stats?.totalMedicines ?? '—', icon: Package, color: 'blue' },
    { title: 'Pending Orders', value: stats?.orders?.pending ?? stats?.pendingOrders ?? '—', icon: ShoppingCart, color: 'yellow' },
    { title: 'Low Stock Items', value: stats?.medicines?.lowStock ?? stats?.lowStockItems ?? '—', icon: AlertTriangle, color: 'red' },
    { title: 'Monthly Revenue', value: (stats?.revenue?.monthly ?? stats?.monthlyRevenue) != null ? `$${Number(stats?.revenue?.monthly ?? stats?.monthlyRevenue).toLocaleString()}` : '—', icon: DollarSign, color: 'green' },
  ];

  const orderData = (stats?.orders?.byStatus || stats?.ordersByStatus)
    ? Object.entries(stats?.orders?.byStatus || stats?.ordersByStatus || {}).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Pharmacy overview at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity size={16} className={apiStatus === 'healthy' ? 'text-green-500' : apiStatus === 'down' ? 'text-red-500' : 'text-gray-400'} />
          <span className={apiStatus === 'healthy' ? 'text-green-600' : apiStatus === 'down' ? 'text-red-600' : 'text-gray-500'}>
            {apiStatus === 'healthy' ? 'API Connected' : apiStatus === 'down' ? 'API Unreachable' : 'Checking...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={loading ? '...' : card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orderData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">
            No order data available
          </div>
        )}
      </div>
    </div>
  );
}
