import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart, DollarSign, Clock, AlertTriangle,
  TrendingUp, Package, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsAPI, ordersAPI } from '../services/api';

const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  emerald: '#10b981',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

const statusColor = (s) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    CONFIRMED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  };
  return map[s] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />;
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, trend, trendLabel, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-8 w-32" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
          <SkeletonBlock className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {trend !== undefined && trend !== null && (
            <div className="flex items-center gap-1 pt-1">
              {trend >= 0 ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500" />
              )}
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-gray-400 dark:text-gray-500">{trendLabel}</span>}
            </div>
          )}
          {subtitle && !trend && (
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, loading, height = 300, action }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
          {action}
        </div>
        <SkeletonBlock className="w-full" style={{ height }} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      const startDate = weekAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const [dashRes, revRes, salesRes, invRes, ordersRes] = await Promise.allSettled([
        analyticsAPI.dashboard(),
        analyticsAPI.revenue({ startDate, endDate }),
        analyticsAPI.sales(),
        analyticsAPI.inventory(),
        ordersAPI.list({ limit: 5 }),
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data?.data || dashRes.value.data);
      if (revRes.status === 'fulfilled') {
        const raw = revRes.value.data?.data || revRes.value.data;
        setRevenue(Array.isArray(raw?.daily) ? raw.daily : Array.isArray(raw) ? raw : []);
      }
      if (salesRes.status === 'fulfilled') setSales(salesRes.value.data?.data || salesRes.value.data);
      if (invRes.status === 'fulfilled') setInventory(invRes.value.data?.data || invRes.value.data);
      if (ordersRes.status === 'fulfilled') {
        const raw = ordersRes.value.data?.data || ordersRes.value.data;
        setRecentOrders(Array.isArray(raw) ? raw : raw?.orders || []);
      }

      setLoading(false);
    };
    load();
  }, []);

  const revenueData = useMemo(() => {
    if (!revenue.length) return [];
    return revenue.map((d) => ({
      name: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: d.revenue || 0,
      orders: d.orders || 0,
    }));
  }, [revenue]);

  const topMedicines = useMemo(() => {
    const list = sales?.topMedicines || [];
    return list.slice(0, 6).map((m) => ({
      name: m.name?.length > 16 ? m.name.slice(0, 16) + '…' : m.name,
      fullName: m.name,
      revenue: m.totalRevenue || 0,
      sold: m.totalSold || 0,
    }));
  }, [sales]);

  const categoryData = useMemo(() => {
    const list = sales?.salesByCategory || [];
    return list.slice(0, 6).map((c, i) => ({
      category: c.category,
      revenue: c.totalRevenue || 0,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [sales]);

  const stockByCategory = useMemo(() => {
    const list = inventory?.stockByCategory || [];
    return list.slice(0, 6).map((c) => ({
      name: c.category,
      stock: c.totalStock || 0,
    }));
  }, [inventory]);

  const lowStockItems = useMemo(() => inventory?.lowStock || [], [inventory]);
  const expiringItems = useMemo(() => inventory?.expiringSoon || [], [inventory]);

  const d = dashboard || {};
  const statsData = [
    {
      title: "Today's Orders",
      value: d.orders?.today?.toLocaleString() ?? '—',
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      trend: d.orders?.todayChange,
      trendLabel: 'vs yesterday',
    },
    {
      title: "Today's Revenue",
      value: d.revenue?.today != null ? `$${d.revenue.today.toLocaleString()}` : '—',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
      trend: d.revenue?.todayChange,
      trendLabel: 'vs yesterday',
    },
    {
      title: 'Pending Orders',
      value: d.orders?.pending?.toLocaleString() ?? '—',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
      subtitle: 'Awaiting processing',
    },
    {
      title: 'Low Stock Items',
      value: d.medicines?.lowStock?.toLocaleString() ?? lowStockItems.length.toLocaleString() ?? '—',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
      subtitle: 'Need restocking',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Pharmacy Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here's what's happening with your pharmacy today.
            </p>
          </div>
          {!loading && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((s) => (
            <StatCard key={s.title} {...s} loading={loading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard
            title="Revenue Trend"
            subtitle="Last 7 days"
            loading={loading}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.length ? revenueData : [
                { name: 'Mon', revenue: 0 },
                { name: 'Tue', revenue: 0 },
                { name: 'Wed', revenue: 0 },
                { name: 'Thu', revenue: 0 },
                { name: 'Fri', revenue: 0 },
                { name: 'Sat', revenue: 0 },
                { name: 'Sun', revenue: 0 },
              ]}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.blue} strokeWidth={2.5} fill="url(#revenueGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Sales by Category"
            subtitle="Revenue distribution"
            loading={loading}
            height={300}
          >
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="revenue"
                    nameKey="category"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard
            title="Top Medicines"
            subtitle="Best sellers this period"
            loading={loading}
            height={280}
          >
            {topMedicines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicines} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill={CHART_COLORS.emerald} radius={[0, 6, 6, 0]} name="Revenue" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Stock Distribution"
            subtitle="Inventory by category"
            loading={loading}
            height={280}
          >
            {stockByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                No stock data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" fill={CHART_COLORS.violet} radius={[6, 6, 0, 0]} name="Units in Stock" barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{lowStockItems.length} items need attention</p>
                </div>
              </div>
              {expiringItems.length > 0 && (
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-full">
                  {expiringItems.length} expiring soon
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <SkeletonBlock className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <SkeletonBlock className="h-3 w-32" />
                        <SkeletonBlock className="h-2.5 w-20" />
                      </div>
                      <SkeletonBlock className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                  <Package size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">All stock levels healthy</p>
                  <p className="text-xs mt-1">No items need restocking</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
                  {lowStockItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.stockQuantity <= 5
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {item.stockQuantity} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShoppingCart size={16} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Latest {recentOrders.length} orders</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium text-right">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-700/30">
                        <td className="px-5 py-3"><SkeletonBlock className="h-3 w-16" /></td>
                        <td className="px-5 py-3"><SkeletonBlock className="h-3 w-24" /></td>
                        <td className="px-5 py-3 text-right"><SkeletonBlock className="h-3 w-14 ml-auto" /></td>
                        <td className="px-5 py-3"><SkeletonBlock className="h-5 w-20 rounded-full" /></td>
                        <td className="px-5 py-3 text-right"><SkeletonBlock className="h-3 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                          <Activity size={36} className="mb-3 opacity-40" />
                          <p className="text-sm font-medium">No recent orders</p>
                          <p className="text-xs mt-1">Orders will appear here once placed.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, i) => (
                      <tr key={order._id || i} className="border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            #{order.orderNumber || order._id?.slice(-6).toUpperCase() || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {order.customer?.name || order.user?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${(order.totalAmount || order.total || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                            {order.status || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
