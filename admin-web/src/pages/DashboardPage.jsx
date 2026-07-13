import { useEffect, useState } from 'react';
import { dashboardAPI, healthAPI } from '../services/api';
import { Users, Pill, ShoppingCart, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([dashboardAPI.stats(), healthAPI.check()])
      .then(([statsRes, healthRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || statsRes.value.data);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-blue-500' },
    { label: 'Total Medicines', value: stats?.totalMedicines ?? '—', icon: Pill, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '—', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${health ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <Activity size={16} /> API {health ? 'Connected' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{loading ? '...' : card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-4">Orders Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fallbackData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
