import { useState, useEffect, useCallback } from 'react';
import { BarChart3, ShoppingCart, DollarSign, Package, Users, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import { reportsAPI } from '../services/api';

const tabs = [
  { key: 'sales', label: 'Sales', icon: ShoppingCart },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
];

const inputClass = 'px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      let res;
      switch (activeTab) {
        case 'sales': res = await reportsAPI.sales(params); break;
        case 'revenue': res = await reportsAPI.revenue(params); break;
        case 'inventory': res = await reportsAPI.inventory(params); break;
        case 'users': res = await reportsAPI.users(params); break;
        default: res = await reportsAPI.sales(params);
      }
      const d = res.data?.data || res.data;
      setData(d || {});
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary = data?.summary || data;
  const items = data?.orders || data?.items || data?.products || data?.roles || data?.dailyBreakdown || data?.breakdown || [];

  const salesColumns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => <span className="font-medium text-gray-900">{v || row._id?.slice(-6) || '—'}</span> },
    { key: 'customer', label: 'Customer', render: (v, row) => v?.name || row.user?.name || '—' },
    { key: 'totalAmount', label: 'Total', render: (v) => `$${Number(v || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v) => {
      const colors = { delivered: 'bg-green-50 text-green-700', completed: 'bg-green-50 text-green-700', pending: 'bg-yellow-50 text-yellow-700', cancelled: 'bg-red-50 text-red-700', processing: 'bg-blue-50 text-blue-700' };
      return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors[v?.toLowerCase()] || 'bg-gray-50 text-gray-600'}`}>{v || '—'}</span>;
    }},
    { key: 'paymentStatus', label: 'Payment', render: (v) => {
      const colors = { paid: 'text-green-600', pending: 'text-yellow-600', failed: 'text-red-600', refunded: 'text-gray-500' };
      return <span className={`text-xs font-medium ${colors[v?.toLowerCase()] || 'text-gray-500'}`}>{v || '—'}</span>;
    }},
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  const inventoryColumns = [
    { key: 'name', label: 'Product', render: (v, row) => <span className="font-medium text-gray-900">{v || row.medicine?.name || '—'}</span> },
    { key: 'sku', label: 'SKU', render: (v, row) => v || row.medicine?.sku || '—' },
    { key: 'stock', label: 'Stock', render: (v, row) => {
      const qty = v ?? row.quantity ?? 0;
      return <span className={`font-medium ${qty === 0 ? 'text-red-600' : qty <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>{qty}</span>;
    }},
    { key: 'status', label: 'Status', render: (v, row) => {
      const qty = row.stock ?? row.quantity ?? 0;
      const label = v || (qty === 0 ? 'Out of Stock' : 'Low Stock');
      return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${qty === 0 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{label}</span>;
    }},
    { key: 'category', label: 'Category', render: (v, row) => v || row.medicine?.category?.name || '—' },
  ];

  const revenueColumns = [
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'revenue', label: 'Revenue', render: (v) => <span className="font-medium text-gray-900">${Number(v || 0).toFixed(2)}</span> },
    { key: 'orders', label: 'Orders', render: (v) => v || 0 },
    { key: 'avgOrderValue', label: 'Avg Order', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
  ];

  const usersColumns = [
    { key: 'role', label: 'Role', render: (v) => <span className="font-medium text-gray-900 capitalize">{v || '—'}</span> },
    { key: 'count', label: 'Count', render: (v) => <span className="font-medium text-gray-900">{v ?? '—'}</span> },
    { key: 'verified', label: 'Verified', render: (v) => v != null ? String(v) : '—' },
    { key: 'active', label: 'Active', render: (v) => v != null ? String(v) : '—' },
  ];

  const columnsMap = { sales: salesColumns, revenue: revenueColumns, inventory: inventoryColumns, users: usersColumns };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">View sales, revenue, inventory and user reports</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === t.key ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {(activeTab === 'sales' || activeTab === 'revenue') && (
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${Number(summary?.totalRevenue || summary?.revenue || 0).toFixed(2)}`} color="bg-green-50 text-green-600" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={summary?.totalOrders || summary?.orders || 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={TrendingUp} label="Avg Order Value" value={`$${Number(summary?.avgOrderValue || summary?.averageOrderValue || 0).toFixed(2)}`} color="bg-purple-50 text-purple-600" />
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${Number(summary?.totalRevenue || summary?.revenue || 0).toFixed(2)}`} color="bg-green-50 text-green-600" />
          <StatCard icon={TrendingUp} label="Avg Daily Revenue" value={`$${Number(summary?.avgDailyRevenue || summary?.averageDaily || 0).toFixed(2)}`} color="bg-blue-50 text-blue-600" />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Package} label="Total Products" value={summary?.totalProducts || summary?.total || 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={summary?.lowStock || summary?.lowStockCount || 0} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={XCircle} label="Out of Stock" value={summary?.outOfStock || summary?.outOfStockCount || 0} color="bg-red-50 text-red-600" />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Total Users" value={summary?.totalUsers || summary?.total || 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Users} label="Verified" value={summary?.verifiedUsers || summary?.verified || 0} color="bg-green-50 text-green-600" />
          <StatCard icon={Users} label="Active" value={summary?.activeUsers || summary?.active || 0} color="bg-purple-50 text-purple-600" />
        </div>
      )}

      <DataTable
        columns={columnsMap[activeTab]}
        data={Array.isArray(items) ? items : []}
        loading={loading}
        emptyIcon={BarChart3}
        emptyTitle="No data"
        emptyDescription="No report data available for the selected period"
      />
    </div>
  );
}
