import { useEffect, useState, useCallback } from 'react';
import { usersAPI, rolesAPI } from '../services/api';
import {
  Users as UsersIcon, Eye, Pause, Play, Shield,
  Mail, Phone, Building2, Clock, ChevronDown
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusIndicator from '../components/StatusIndicator';
import RoleBadge from '../components/RoleBadge';
import UserAvatar from '../components/UserAvatar';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const roleFilters = ['all', 'admin', 'pharmacy_owner', 'pharmacy_manager', 'driver', 'customer'];

function timeAgo(date) {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [detailHistory, setDetailHistory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  const load = useCallback(async (p = page, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (s) params.search = s;
      if (r !== 'all') params.role = r;
      const res = await usersAPI.list(params);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(data.length > 0 ? Math.ceil(data.length / 10) : 1);
        setTotal(data.length);
      } else {
        setUsers(Array.isArray(data?.users) ? data.users : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      }
    } catch {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    load();
    rolesAPI.list().then((res) => {
      const data = res.data?.data;
      setRoles(Array.isArray(data) ? data : data?.roles || []);
    }).catch(() => {});
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    load(1, val, roleFilter);
  };

  const handleRoleFilter = (r) => {
    setRoleFilter(r);
    setPage(1);
    load(1, search, r);
  };

  const handlePageChange = (p) => {
    setPage(p);
    load(p, search, roleFilter);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setToggleLoading(true);
    try {
      await usersAPI.toggle(toggleTarget.id || toggleTarget._id);
      toast.success(`User ${toggleTarget.status === 'active' ? 'suspended' : 'activated'}`);
      setToggleTarget(null);
      load();
    } catch {
      toast.error('Failed to toggle user status');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleViewDetail = async (user) => {
    setDetail(user);
    setDetailLoading(true);
    try {
      const res = await usersAPI.history(user.id || user._id);
      setDetailHistory(res.data?.data || res.data);
    } catch {
      setDetailHistory(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!roleTarget || !selectedRole) return;
    setRoleLoading(true);
    try {
      await usersAPI.assignRole(roleTarget.id || roleTarget._id, selectedRole);
      toast.success('Role assigned successfully');
      setRoleTarget(null);
      setSelectedRole('');
      load();
    } catch {
      toast.error('Failed to assign role');
    } finally {
      setRoleLoading(false);
    }
  };

  const columns = [
    {
      key: 'name', label: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.name} size={36} />
          <div>
            <p className="font-medium dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email', label: 'Email',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Mail size={13} />{val}
        </span>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (val) => <RoleBadge role={val} />,
    },
    {
      key: 'branchName', label: 'Branch',
      render: (val) => (
        <span className="text-gray-600 dark:text-gray-400">
          {val || <span className="text-gray-400 dark:text-gray-600">—</span>}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <StatusIndicator status={val === 'suspended' ? 'inactive' : val} />,
    },
    {
      key: 'lastActive', label: 'Last Active',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={12} />{timeAgo(val)}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: '120px',
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
            onClick={() => { setRoleTarget(row); setSelectedRole(row.role || ''); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="Assign role"
          >
            <Shield size={16} />
          </button>
          <button
            onClick={() => setToggleTarget(row)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title={row.status === 'active' ? 'Suspend' : 'Activate'}
          >
            {row.status === 'active' ? <Pause size={16} className="text-orange-500" /> : <Play size={16} className="text-green-500" />}
          </button>
        </div>
      ),
    },
  ];

  const history = detailHistory;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle={`${total} users across all pharmacies`}
      />

      <div className="flex flex-wrap items-center gap-2">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => handleRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              roleFilter === r
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {r === 'all' ? 'All Roles' : r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyIcon={UsersIcon}
        emptyTitle="No users found"
        emptyDescription="No users match your current filters."
        searchPlaceholder="Search by name or email..."
        onSearch={handleSearch}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: handlePageChange,
        }}
      />

      <Modal open={!!detail} onClose={() => { setDetail(null); setDetailHistory(null); }} title={detail?.name || 'User Details'} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <UserAvatar name={detail.name} size={56} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg dark:text-white">{detail.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{detail.email}</p>
                <RoleBadge role={detail.role} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Phone, label: 'Phone', value: detail.phone || 'N/A' },
                { icon: Shield, label: 'Role', value: (detail.role || '').replace(/_/g, ' ') },
                { icon: Building2, label: 'Branch', value: detail.branchName || 'N/A' },
                { icon: Clock, label: 'Last Active', value: timeAgo(detail.lastActive) },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  </div>
                  <p className="text-sm font-medium dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {detailLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : history && (
              <div>
                <h4 className="font-medium dark:text-white mb-2 text-sm">Activity History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(Array.isArray(history) ? history : history?.entries || []).slice(0, 10).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
                      <Clock size={13} className="text-gray-400 shrink-0" />
                      <span className="dark:text-gray-300">{h.action || h.description || JSON.stringify(h)}</span>
                      <span className="text-xs text-gray-400 ml-auto shrink-0">{timeAgo(h.timestamp || h.date)}</span>
                    </div>
                  ))}
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
        title={toggleTarget?.status === 'active' ? 'Suspend User' : 'Activate User'}
        message={`Are you sure you want to ${toggleTarget?.status === 'active' ? 'suspend' : 'activate'} "${toggleTarget?.name}"? ${toggleTarget?.status === 'active' ? 'The user will not be able to access the platform.' : 'The user will regain full access.'}`}
        confirmText={toggleTarget?.status === 'active' ? 'Suspend' : 'Activate'}
        confirmVariant={toggleTarget?.status === 'active' ? 'danger' : 'primary'}
      />

      <Modal open={!!roleTarget} onClose={() => { setRoleTarget(null); setSelectedRole(''); }} title="Assign Role" size="sm">
        {roleTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <UserAvatar name={roleTarget.name} size={40} />
              <div>
                <p className="font-medium dark:text-white">{roleTarget.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleTarget.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Select Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none"
                >
                  <option value="">Choose a role...</option>
                  {roles.map((r) => (
                    <option key={r.id || r._id} value={r.id || r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setRoleTarget(null); setSelectedRole(''); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!selectedRole || roleLoading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                {roleLoading ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
