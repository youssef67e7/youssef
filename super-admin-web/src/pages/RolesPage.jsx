import { useEffect, useState } from 'react';
import { rolesAPI, permissionsAPI } from '../services/api';
import {
  Shield, Plus, Trash2, Edit2, Users, Lock,
  Check, X, Save, ChevronDown, Info
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const fallbackRoles = [
  { id: '1', name: 'Super Admin', description: 'Full system access', permissions: 15, userCount: 2, isSystem: true },
  { id: '2', name: 'Admin', description: 'System administration', permissions: 12, userCount: 5, isSystem: true },
  { id: '3', name: 'Pharmacy Owner', description: 'Pharmacy ownership management', permissions: 5, userCount: 47, isSystem: false },
  { id: '4', name: 'Pharmacy Manager', description: 'Branch management', permissions: 3, userCount: 89, isSystem: false },
  { id: '5', name: 'Driver', description: 'Delivery operations', permissions: 1, userCount: 892, isSystem: true },
  { id: '6', name: 'Customer', description: 'Customer access', permissions: 1, userCount: 87652, isSystem: true },
];

const fallbackPermissions = [
  'dashboard.view', 'medicines.view', 'medicines.create', 'medicines.edit', 'medicines.delete',
  'orders.view', 'orders.manage', 'customers.view', 'customers.manage', 'drivers.view',
  'coupons.manage', 'reports.view', 'analytics.view', 'settings.manage', 'users.manage',
];

export default function RolesPage() {
  const [tab, setTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);

  const loadRoles = async () => {
    try {
      const res = await rolesAPI.list();
      const data = res.data?.data;
      setRoles(Array.isArray(data) ? data : data?.roles || fallbackRoles);
    } catch {
      setRoles(fallbackRoles);
    }
  };

  const loadPermissions = async () => {
    try {
      const [permsRes, matrixRes] = await Promise.allSettled([permissionsAPI.list(), permissionsAPI.matrix()]);
      if (permsRes.status === 'fulfilled') {
        const data = permsRes.value.data?.data;
        setPermissions(Array.isArray(data) ? data : data?.permissions || fallbackPermissions);
      } else {
        setPermissions(fallbackPermissions);
      }
      if (matrixRes.status === 'fulfilled') {
        setMatrix(matrixRes.value.data?.data || {});
      }
    } catch {
      setPermissions(fallbackPermissions);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadRoles(), loadPermissions()]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditRole(null);
    setForm({ name: '', description: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (role) => {
    setEditRole(role);
    setForm({ name: role.name, description: role.description || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Role name is required';
    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    const duplicate = roles.find(
      (r) => r.name.toLowerCase() === form.name.trim().toLowerCase() && (r.id || r._id) !== (editRole?.id || editRole?._id)
    );
    if (duplicate) errors.name = 'A role with this name already exists';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveLoading(true);
    try {
      if (editRole) {
        await rolesAPI.update(editRole.id || editRole._id, { name: form.name.trim(), description: form.description.trim() });
        toast.success('Role updated');
      } else {
        await rolesAPI.create({ name: form.name.trim(), description: form.description.trim() });
        toast.success('Role created');
      }
      setShowForm(false);
      setEditRole(null);
      setForm({ name: '', description: '' });
      loadRoles();
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await rolesAPI.delete(deleteTarget.id || deleteTarget._id);
      toast.success('Role deleted');
      setDeleteTarget(null);
      loadRoles();
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePermission = async (roleId, perm) => {
    const newMatrix = { ...matrix };
    const perms = new Set(newMatrix[roleId] || []);
    if (perms.has(perm)) perms.delete(perm); else perms.add(perm);
    newMatrix[roleId] = [...perms];
    setMatrix(newMatrix);
    setMatrixSaving(true);
    try {
      await permissionsAPI.updateMatrix(newMatrix);
    } catch {
      toast.error('Failed to update permissions');
    } finally {
      setMatrixSaving(false);
    }
  };

  const permGroups = {};
  permissions.forEach((p) => {
    const group = typeof p === 'string' ? p.split('.')[0] : p.group || 'Other';
    const name = typeof p === 'string' ? p : p.name || p;
    if (!permGroups[group]) permGroups[group] = [];
    permGroups[group].push(name);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        subtitle={`${roles.length} roles configured`}
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} />
            Create Role
          </button>
        }
      />

      <div className="flex border-b dark:border-gray-700">
        {[
          ['roles', 'Roles'],
          ['matrix', 'Permission Matrix'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              tab === key
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'roles' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id || role._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <RoleBadge role={role.name?.toLowerCase().replace(/ /g, '_')} />
                    {!role.isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(role)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit role"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-red-500"
                          title="Delete role"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    {role.isSystem && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Lock size={12} /> System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {role.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-3 border-t dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      <Shield size={12} />
                      {typeof role.permissions === 'number' ? role.permissions : (role.permissions?.length || 0)} permissions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {(role.userCount || 0).toLocaleString()} users
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'matrix' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle permissions for each role. Changes are saved automatically.
              </p>
            </div>
            {matrixSaving && (
              <span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
                <Save size={12} /> Saving...
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th key={r.id || r._id} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permGroups).map(([group, perms]) => (
                  <>
                    <tr key={`group-${group}`}>
                      <td
                        colSpan={roles.length + 1}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {group}
                      </td>
                    </tr>
                    {perms.map((perm) => (
                      <tr key={perm} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-2.5 font-medium dark:text-white text-sm">{perm}</td>
                        {roles.map((r) => (
                          <td key={r.id || r._id} className="px-3 py-2.5 text-center">
                            <label className="inline-flex items-center justify-center w-full cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(matrix[r.id || r._id] || []).includes(perm)}
                                onChange={() => togglePermission(r.id || r._id, perm)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                              />
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {Object.keys(permGroups).length === 0 && (
            <EmptyState
              icon={Shield}
              title="No permissions loaded"
              description="Permissions will appear here once configured."
            />
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editRole ? 'Edit Role' : 'Create New Role'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Role Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: null }); }}
              placeholder="e.g. Inventory Manager"
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition ${
                formErrors.name ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this role's responsibilities..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {saveLoading ? 'Saving...' : editRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        confirmText={deleteLoading ? 'Deleting...' : 'Delete Role'}
        confirmVariant="danger"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${
          deleteTarget?.userCount > 0
            ? `${deleteTarget.userCount} users currently have this role and will lose their permissions.`
            : 'This action cannot be undone.'
        }`}
      />
    </div>
  );
}
