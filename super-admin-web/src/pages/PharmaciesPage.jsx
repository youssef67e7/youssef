import { useEffect, useState, useCallback } from 'react';
import { pharmaciesAPI } from '../services/api';
import {
  Building2, Eye, Pause, Play, Plus,
  MapPin, Star, DollarSign, ShoppingCart,
  TrendingUp, Mail, Home
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusIndicator from '../components/StatusIndicator';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const statusFilters = ['all', 'active', 'inactive'];

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [detailMetrics, setDetailMetrics] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', city: '', address: '', managerEmail: '', phone: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const load = useCallback(async (p = page, s = search, f = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      if (f !== 'all') params.status = f;
      const res = await pharmaciesAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setPharmacies(data);
        setTotalPages(data.length > 0 ? Math.ceil(data.length / 10) : 1);
        setTotal(data.length);
      } else {
        setPharmacies(Array.isArray(data?.pharmacies) ? data.pharmacies : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      }
    } catch {
      toast.error('Failed to load pharmacies');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    load(1, val, statusFilter);
  };

  const handleStatusFilter = (f) => {
    setStatusFilter(f);
    setPage(1);
    load(1, search, f);
  };

  const handlePageChange = (p) => {
    setPage(p);
    load(p, search, statusFilter);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setToggleLoading(true);
    try {
      await pharmaciesAPI.toggle(toggleTarget.id || toggleTarget._id);
      toast.success(`Pharmacy ${toggleTarget.status === 'active' ? 'deactivated' : 'activated'}`);
      setToggleTarget(null);
      load();
    } catch {
      toast.error('Failed to toggle pharmacy status');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleViewDetail = async (pharmacy) => {
    setDetail(pharmacy);
    setDetailLoading(true);
    try {
      const res = await pharmaciesAPI.metrics(pharmacy.id || pharmacy._id);
      setDetailMetrics(res.data?.data || res.data);
    } catch {
      setDetailMetrics(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.city.trim()) {
      toast.error('Name and city are required');
      return;
    }
    setCreateLoading(true);
    try {
      await pharmaciesAPI.create(createForm);
      toast.success('Pharmacy created');
      setShowCreate(false);
      setCreateForm({ name: '', city: '', address: '', managerEmail: '', phone: '' });
      load();
    } catch {
      toast.error('Failed to create pharmacy');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Name', sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin size={11} />{row.address || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'city', label: 'City', sortable: true,
      render: (val) => <span className="text-gray-600 dark:text-gray-400">{val || '—'}</span>,
    },
    {
      key: 'managerName', label: 'Manager',
      render: (val) => <span className="text-gray-600 dark:text-gray-400">{val || '—'}</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (val) => <StatusIndicator status={val} />,
    },
    {
      key: 'totalRevenue', label: 'Revenue', sortable: true,
      render: (val) => (
        <span className="font-semibold dark:text-white">${(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'totalOrders', label: 'Orders', sortable: true,
      render: (val) => <span className="dark:text-gray-300">{(val || 0).toLocaleString()}</span>,
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="font-medium dark:text-white">{val || '—'}</span>
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setToggleTarget(row)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'active' ? <Pause size={16} className="text-orange-500" /> : <Play size={16} className="text-green-500" />}
          </button>
        </div>
      ),
    },
  ];

  const metrics = detailMetrics;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacies"
        subtitle={`${total} branches across the platform`}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} />
            Add Pharmacy
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => handleStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={pharmacies}
        loading={loading}
        emptyIcon={Building2}
        emptyTitle="No pharmacies found"
        emptyDescription="No pharmacies match your current filters."
        searchPlaceholder="Search by name or city..."
        onSearch={handleSearch}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: handlePageChange,
        }}
      />

      <Modal open={!!detail} onClose={() => { setDetail(null); setDetailMetrics(null); }} title={detail?.name || 'Pharmacy Details'} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Status', value: <StatusIndicator status={detail.status} /> },
                { label: 'City', value: detail.city || '—' },
                { label: 'Manager', value: detail.managerName || '—' },
                { label: 'Rating', value: <span className="inline-flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{detail.rating || '—'}</span> },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                  <div className="font-medium dark:text-white text-sm">{item.value}</div>
                </div>
              ))}
            </div>

            {detailLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 animate-pulse">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Revenue</p>
                  </div>
                  <p className="text-lg font-bold dark:text-white">${(metrics.revenue || metrics.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart size={14} className="text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Orders</p>
                  </div>
                  <p className="text-lg font-bold dark:text-white">{(metrics.orders || metrics.totalOrders || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Growth</p>
                  </div>
                  <p className="text-lg font-bold dark:text-white">{metrics.growth || '—'}%</p>
                </div>
              </div>
            )}

            {detail.address && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Home size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Address</p>
                  <p className="text-sm dark:text-white">{detail.address}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.status === 'active' ? 'Deactivate Pharmacy' : 'Activate Pharmacy'}
        message={`Are you sure you want to ${toggleTarget?.status === 'active' ? 'deactivate' : 'activate'} "${toggleTarget?.name}"? ${toggleTarget?.status === 'active' ? 'This will prevent customers from placing orders at this branch.' : 'This will make the branch available for orders again.'}`}
        confirmText={toggleTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleTarget?.status === 'active' ? 'danger' : 'primary'}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Pharmacy" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Pharmacy Name *</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. PharmaWorld Downtown"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">City *</label>
            <input
              type="text"
              value={createForm.city}
              onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
              placeholder="e.g. New York"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              placeholder="e.g. 123 Main St"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Manager Email</label>
            <input
              type="email"
              value={createForm.managerEmail}
              onChange={(e) => setCreateForm({ ...createForm, managerEmail: e.target.value })}
              placeholder="manager@example.com"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="+201234567890"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={createLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {createLoading ? 'Creating...' : 'Create Pharmacy'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
