import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Search, X, Ban, CheckCircle, Users as UsersIcon } from 'lucide-react';
import { usersAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLES = ['user', 'admin', 'pharmacy_owner', 'pharmacy_manager', 'driver', 'delivery_staff'];

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'user', isActive: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [roles, setRoles] = useState(ROLES);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersAPI.list(params);
      const items = res.data?.data || res.data || [];
      const list = items?.data || items?.users || items;
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  const loadRoles = async () => {
    try {
      const res = await usersAPI.roles();
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setRoles(data.map(r => r.name || r));
      }
    } catch {
      // fallback to defaults
    }
  };

  useEffect(() => { load(); loadRoles(); }, [roleFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingId(u._id || u.id);
    setForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'user',
      isActive: u.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        isActive: form.isActive,
      };
      if (editingId) {
        if (form.password) data.password = form.password;
        await usersAPI.update(editingId, data);
        toast.success('User updated');
      } else {
        if (!form.password) {
          toast.error('Password is required for new users');
          setSaving(false);
          return;
        }
        data.password = form.password;
        await usersAPI.create(data);
        toast.success('User created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await usersAPI.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await usersAPI.update(u._id || u.id, { isActive: u.isActive === false });
      toast.success(u.isActive !== false ? 'User deactivated' : 'User activated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and roles"
        breadcrumbs={['Dashboard', 'Users']}
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            <Plus size={16} /> Add User
          </button>
        }
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Search by name, email..."
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            Search
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit User' : 'Create User'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password {!editingId ? '*' : '(leave blank to keep)'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex items-end gap-2 lg:col-span-3">
              <button type="submit" disabled={saving} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Role</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Last Active</th>
                <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <UsersIcon size={48} className="mx-auto mb-2 opacity-50" />
                  No users found
                </td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 font-medium dark:text-white">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize">
                        {(u.role || 'user').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.isActive !== false ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(u.lastActive || u.lastLoginAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="text-blue-500 hover:text-blue-700" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={u.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}
                          title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive !== false ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={() => setDeleteId(u._id || u.id)} className="text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
