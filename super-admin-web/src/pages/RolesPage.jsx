import { useEffect, useState } from 'react';
import { rolesAPI, permissionsAPI } from '../services/api';
import { Shield, Plus, Trash2, Edit2, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import RoleBadge from '../components/RoleBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const fallbackRoles = [
  { id: '1', name: 'Super Admin', description: 'Full system access', permissions: 15, userCount: 2, isSystem: true },
  { id: '2', name: 'Admin', description: 'System administration', permissions: 12, userCount: 5, isSystem: true },
  { id: '3', name: 'Pharmacy Owner', description: 'Pharmacy ownership management', permissions: 5, userCount: 47, isSystem: false },
  { id: '4', name: 'Pharmacy Manager', description: 'Branch management', permissions: 3, userCount: 89, isSystem: false },
  { id: '5', name: 'Driver', description: 'Delivery operations', permissions: 1, userCount: 892, isSystem: true },
  { id: '6', name: 'Customer', description: 'Customer access', permissions: 1, userCount: 87652, isSystem: true },
];

const allPermissions = [
  'dashboard.view', 'medicines.view', 'medicines.create', 'medicines.edit', 'medicines.delete',
  'orders.view', 'orders.manage', 'customers.view', 'customers.manage', 'drivers.view',
  'coupons.manage', 'reports.view', 'analytics.view', 'settings.manage', 'users.manage',
];

export default function RolesPage() {
  const [tab, setTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.allSettled([rolesAPI.list(), permissionsAPI.matrix()])
      .then(([r, m]) => {
        if (r.status === 'fulfilled') {
          const data = r.value.data?.data;
          setRoles(Array.isArray(data) ? data : data?.roles || fallbackRoles);
        } else setRoles(fallbackRoles);
        if (m.status === 'fulfilled') setMatrix(m.value.data?.data || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      if (editRole) { await rolesAPI.update(editRole.id || editRole._id, form); toast.success('Role updated'); }
      else { await rolesAPI.create(form); toast.success('Role created'); }
      setShowForm(false); setEditRole(null); setForm({ name: '', description: '' });
      const res = await rolesAPI.list();
      const data = res.data?.data;
      setRoles(Array.isArray(data) ? data : data?.roles || []);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await rolesAPI.delete(deleteTarget.id || deleteTarget._id); toast.success('Role deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed'); }
  };

  const togglePermission = async (roleId, permId) => {
    const newMatrix = { ...matrix };
    const perms = new Set(newMatrix[roleId] || []);
    if (perms.has(permId)) perms.delete(permId); else perms.add(permId);
    newMatrix[roleId] = [...perms];
    setMatrix(newMatrix);
    try { await permissionsAPI.updateMatrix(newMatrix); }
    catch { toast.error('Failed to update permissions'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Roles & Permissions" subtitle={`${roles.length} roles defined`} actions={
        <button onClick={() => { setEditRole(null); setForm({ name: '', description: '' }); setShowForm(true); }}
          className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
          <Plus size={16} /> Create Role
        </button>
      } />

      <div className="flex border-b dark:border-gray-700">
        {[['roles', 'Roles'], ['matrix', 'Permission Matrix']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${tab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.id || role._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-2">
                <RoleBadge role={role.name?.toLowerCase().replace(/ /g, '_')} />
                {!role.isSystem && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditRole(role); setForm({ name: role.name, description: role.description }); setShowForm(true); }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(role)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{role.description}</p>
              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>{typeof role.permissions === 'number' ? role.permissions : (role.permissions?.length || 0)} permissions</span>
                <span>{role.userCount?.toLocaleString()} users</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Permission</th>
                {roles.map(r => <th key={r.id} className="px-3 py-3 text-center font-medium">{r.name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {allPermissions.map(perm => (
                <tr key={perm} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2.5 font-medium dark:text-white">{perm}</td>
                  {roles.map(r => (
                    <td key={r.id} className="px-3 py-2.5 text-center">
                      <input type="checkbox" checked={(matrix[r.id] || []).includes(perm)} onChange={() => togglePermission(r.id, perm)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{editRole ? 'Edit Role' : 'Create Role'}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Role Name"
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={3}
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">{editRole ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Role" confirmText="Delete"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${deleteTarget?.userCount} users currently have this role.`} />
    </div>
  );
}
