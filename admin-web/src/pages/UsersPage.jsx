import { useState, useEffect, useCallback } from 'react';
import { Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { usersAPI } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await usersAPI.list(params);
      const d = data.data || data;
      setUsers(d.users || d.items || d || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await usersAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const toggleActive = async (u) => {
    try {
      await usersAPI.update(u._id || u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-gray-900">{v || '—'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'isActive', label: 'Status', render: (v, row) => (
      <button onClick={() => toggleActive(row)} className="flex items-center gap-1">
        {v !== false ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
        <span className={`text-xs font-medium ${v !== false ? 'text-green-600' : 'text-gray-500'}`}>{v !== false ? 'Active' : 'Inactive'}</span>
      </button>
    )},
    { key: 'createdAt', label: 'Joined', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: 'Actions', width: '80px', render: (_, row) => (
      <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
        <Trash2 size={16} />
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage registered customers</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="Registered users will appear here"
        searchPlaceholder="Search by name or email..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.email}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
