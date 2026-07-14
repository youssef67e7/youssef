import { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Clock, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI } from '../services/api';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, icon: Icon, gradient, subtitle }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-xl">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-300">{p.name}: {typeof p.value === 'number' ? `$${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [s, r, sl, inv] = await Promise.allSettled([
          analyticsAPI.dashboard(),
          analyticsAPI.revenue({ startDate: start.toISOString(), endDate: now.toISOString() }),
          analyticsAPI.sales(),
          analyticsAPI.inventory(),
        ]);
        if (s.status === 'fulfilled') setStats(s.value.data?.data || s.value.data);
        if (r.status === 'fulfilled') setRevenue(r.value.data?.data || r.value.data);
        if (sl.status === 'fulfilled') setSales(sl.value.data?.data || sl.value.data);
        if (inv.status === 'fulfilled') setInventory(inv.value.data?.data || inv.value.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const dailyRevenue = revenue?.daily || [];
  const topMedicines = (sales?.topMedicines || []).slice(0, 5);
  const salesByCategory = sales?.salesByCategory || [];
  const lowStock = inventory?.lowStock || [];
  const expiringSoon = inventory?.expiringSoon || [];
  const stockByCategory = inventory?.stockByCategory || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pharmacy Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your pharmacy operations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
          <Activity size={14} className="text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400">System Online</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`$${(stats?.revenue?.total || 0).toLocaleString()}`} icon={DollarSign} gradient="from-green-500 to-emerald-600" subtitle={`$${(stats?.revenue?.today || 0).toLocaleString()} today`} />
          <StatCard title="Total Orders" value={(stats?.orders?.total || 0).toLocaleString()} icon={ShoppingCart} gradient="from-blue-500 to-indigo-600" subtitle={`${stats?.orders?.today || 0} today`} />
          <StatCard title="Total Medicines" value={(stats?.medicines?.total || 0).toLocaleString()} icon={Package} gradient="from-violet-500 to-purple-600" subtitle={`${stats?.orders?.thisMonth || 0} orders this month`} />
          <StatCard title="Low Stock Alert" value={stats?.medicines?.lowStock || 0} icon={AlertTriangle} gradient="from-amber-500 to-orange-600" subtitle={`${lowStock.length + expiringSoon.length} items need attention`} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          {loading ? <Skeleton className="h-64" /> : dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5) || v} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No revenue data</div>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sales by Category</h3>
          {loading ? <Skeleton className="h-64" /> : salesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={salesByCategory} dataKey="totalRevenue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {salesByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No category data</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Medicines</h3>
          {loading ? <Skeleton className="h-64" /> : topMedicines.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topMedicines} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalRevenue" fill="#6366f1" radius={[0, 6, 6, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No sales data</div>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stock by Category</h3>
          {loading ? <Skeleton className="h-64" /> : stockByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stockByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalStock" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Stock" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No inventory data</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Low Stock Alerts
          </h3>
          {loading ? <Skeleton className="h-48" /> : lowStock.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {lowStock.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.stockQuantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">All stock levels OK</div>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-rose-500" /> Expiring Soon
          </h3>
          {loading ? <Skeleton className="h-48" /> : expiringSoon.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {expiringSoon.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <span className="text-xs text-rose-600 font-medium">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No items expiring soon</div>}
        </div>
      </div>
    </div>
  );
}
