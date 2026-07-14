import { useEffect, useState } from 'react';
import { analyticsAPI, auditLogsAPI } from '../services/api';
import {
  DollarSign, ShoppingCart, Users, AlertTriangle,
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Activity, Plus, Edit3, Trash2, LogIn, LogOut,
  Package, BarChart3, ArrowUpRight, Pill
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6'];

const activityIcons = {
  CREATE: Plus, UPDATE: Edit3, DELETE: Trash2,
  LOGIN: LogIn, LOGOUT: LogOut, default: Activity,
};

const activityColors = {
  CREATE: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  UPDATE: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  DELETE: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
  LOGIN: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10',
  LOGOUT: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
  default: 'text-gray-500 bg-gray-50 dark:bg-gray-500/10',
};

function timeAgo(date) {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm border border-gray-700">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6" />
      <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
    </div>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [sales, setSales] = useState(null);
  const [users, setUsers] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState('7d');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const [d, r, s, u, i, logs] = await Promise.allSettled([
        analyticsAPI.dashboard(),
        analyticsAPI.revenue({ range: revenueRange }),
        analyticsAPI.sales(),
        analyticsAPI.users(),
        analyticsAPI.inventory(),
        auditLogsAPI.list({ limit: 10 }),
      ]);

      if (d.status === 'fulfilled') setDashboard(d.value.data?.data || d.value.data);
      if (r.status === 'fulfilled') setRevenue(r.value.data?.data || r.value.data);
      if (s.status === 'fulfilled') setSales(s.value.data?.data || s.value.data);
      if (u.status === 'fulfilled') setUsers(u.value.data?.data || u.value.data);
      if (i.status === 'fulfilled') setInventory(i.value.data?.data || i.value.data);
      if (logs.status === 'fulfilled') {
        const ld = logs.value.data?.data || logs.value.data;
        setAuditLogs(Array.isArray(ld) ? ld.slice(0, 8) : []);
      }

      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      analyticsAPI.revenue({ range: revenueRange }).then((r) => {
        setRevenue(r.data?.data || r.data);
      }).catch(() => {});
    }
  }, [revenueRange]);

  const totalRevenue = dashboard?.revenue?.total ?? 0;
  const todayRevenue = dashboard?.revenue?.today ?? 0;
  const monthRevenue = dashboard?.revenue?.thisMonth ?? 0;
  const totalOrders = dashboard?.orders?.total ?? 0;
  const todayOrders = dashboard?.orders?.today ?? 0;
  const monthOrders = dashboard?.orders?.thisMonth ?? 0;
  const totalUsers = dashboard?.users?.total ?? 0;
  const newToday = dashboard?.users?.newToday ?? 0;
  const lowStock = dashboard?.medicines?.lowStock ?? 0;
  const totalMedicines = dashboard?.medicines?.total ?? 0;

  const revenueData = Array.isArray(revenue?.daily) ? revenue.daily.map(d => ({ name: d._id, revenue: d.revenue, orders: d.orders })) : [];
  const topMedicines = Array.isArray(sales?.topMedicines) ? sales.topMedicines.slice(0, 5) : [];
  const salesByCategory = Array.isArray(sales?.salesByCategory) ? sales.salesByCategory : [];
  const userGrowth = Array.isArray(users?.userGrowth) ? users.userGrowth.map(u => ({ name: u._id, users: u.count })) : [];
  const lowStockItems = Array.isArray(inventory?.lowStock) ? inventory.lowStock : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Welcome back, Admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={14} className="opacity-70" />
                <p className="text-xs opacity-70">${todayRevenue.toLocaleString()} today</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{totalOrders.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={14} className="opacity-70" />
                <p className="text-xs opacity-70">{todayOrders.toLocaleString()} today</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Users</p>
              <p className="text-2xl font-bold mt-1">{totalUsers.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="opacity-70" />
                <p className="text-xs opacity-70">+{newToday.toLocaleString()} today</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Low Stock Alert</p>
              <p className="text-2xl font-bold mt-1">{lowStock.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <Pill size={14} className="opacity-70" />
                <p className="text-xs opacity-70">{totalMedicines.toLocaleString()} total</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daily revenue overview</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              {['7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setRevenueRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    revenueRange === range
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold dark:text-white">Sales by Category</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Revenue distribution</p>
            </div>
            <BarChart3 size={18} className="text-gray-400" />
          </div>
          {salesByCategory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="totalRevenue"
                  nameKey="category"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {salesByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold dark:text-white">User Growth</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly new registrations</p>
            </div>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          {userGrowth.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No user growth data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={userGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" name="New Users" fill="url(#userGradient)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold dark:text-white">Top 5 Medicines</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By total revenue</p>
            </div>
            <Pill size={18} className="text-gray-400" />
          </div>
          {topMedicines.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No medicine data available
            </div>
          ) : (
            <div className="space-y-4">
              {topMedicines.map((med, i) => {
                const maxRevenue = topMedicines[0]?.totalRevenue || 1;
                const pct = (med.totalRevenue / maxRevenue) * 100;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-gray-200 truncate max-w-[200px]">{med.name}</span>
                      <span className="text-sm font-semibold dark:text-gray-200">${med.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${PIE_COLORS[i]}, ${PIE_COLORS[(i+1) % PIE_COLORS.length]})`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{med.totalSold.toLocaleString()} units sold</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold dark:text-white">Recent Activity</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Latest actions</span>
          </div>
          <div className="space-y-1">
            {auditLogs.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-10">No recent activity</div>
            ) : auditLogs.map((log) => {
              const actionType = (log.action || '').split('_')[0] || 'default';
              const IconComp = activityIcons[actionType] || activityIcons.default;
              const colorClass = activityColors[actionType] || activityColors.default;
              const actionText = (log.action || '').replace(/_/g, ' ').toLowerCase();
              return (
                <div key={log._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <IconComp size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-gray-200 leading-snug">
                      <span className="font-medium dark:text-white">{log.user?.name || 'System'}</span>
                      {' '}<span className="text-gray-500 dark:text-gray-400">{actionText}</span>{' '}
                      <span className="font-medium dark:text-gray-200">{log.entity || ''}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold dark:text-white">Low Stock Alerts</h3>
              {lowStockItems.length > 0 && (
                <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </div>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="space-y-1">
            {lowStockItems.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-10">All medicines are well stocked</div>
            ) : lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    item.stockQuantity <= 5
                      ? 'bg-red-100 dark:bg-red-500/10 text-red-500'
                      : 'bg-amber-100 dark:bg-amber-500/10 text-amber-500'
                  }`}>
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Running low</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    item.stockQuantity <= 5
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.stockQuantity}
                  </span>
                  <p className="text-xs text-gray-400">left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
