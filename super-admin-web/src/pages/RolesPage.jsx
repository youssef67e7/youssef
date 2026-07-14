import { useEffect, useState, Fragment } from 'react';
import { rolesAPI, permissionsAPI } from '../services/api';
import { Shield, Users, Lock, Info } from 'lucide-react';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const roleDescriptions = {
  SUPER_ADMIN: 'Full system access to all features and settings',
  ADMIN: 'Manages pharmacy operations, staff, and inventory',
  PHARMACIST: 'Handles prescriptions, orders, and medicine management',
  DRIVER: 'Manages deliveries and shipment tracking',
  CUSTOMER: 'Browses products, places orders, and manages profile',
};

const rolePermissions = {
  SUPER_ADMIN: ['users.manage', 'settings.manage', 'analytics.view', 'reports.view', 'orders.manage', 'medicines.manage', 'coupons.manage', 'roles.manage'],
  ADMIN: ['users.view', 'analytics.view', 'reports.view', 'orders.manage', 'medicines.manage', 'coupons.manage'],
  PHARMACIST: ['orders.view', 'orders.manage', 'medicines.view', 'medicines.edit'],
  DRIVER: ['orders.view', 'orders.manage'],
  CUSTOMER: ['orders.view'],
};

const allPermissions = [
  'users.view', 'users.manage', 'settings.manage', 'analytics.view', 'reports.view',
  'orders.view', 'orders.manage', 'medicines.view', 'medicines.edit', 'medicines.manage',
  'coupons.manage', 'roles.manage',
];

export default function RolesPage() {
  const [tab, setTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    rolesAPI.list()
      .then(res => {
        const data = res.data?.data;
        setRoles(Array.isArray(data) ? data : []);
      })
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  const permGroups = {};
  allPermissions.forEach(p => {
    const group = p.split('.')[0];
    if (!permGroups[group]) permGroups[group] = [];
    permGroups[group].push(p);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        subtitle={`${roles.length} system roles configured`}
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Lock size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">System Roles</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Roles are managed by the backend. Contact the development team to add or modify roles.
          </p>
        </div>
      </div>

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
              {[...Array(3)].map((_, i) => (
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
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <RoleBadge role={role.name?.toLowerCase().replace(/ /g, '_')} />
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Lock size={12} /> System
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {role.description || roleDescriptions[role.name] || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-3 border-t dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      <Shield size={12} />
                      {(role.permissions || 0)} permissions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {role.userCount || 0} users
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
          <div className="p-4 border-b dark:border-gray-700 flex items-center gap-2">
            <Info size={16} className="text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permission assignments per role. This is a read-only view.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permission
                  </th>
                  {roles.map(r => (
                    <th key={r.id || r._id} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permGroups).map(([group, perms]) => (
                  <Fragment key={group}>
                    <tr>
                      <td colSpan={roles.length + 1} className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        {group}
                      </td>
                    </tr>
                    {perms.map(perm => (
                      <tr key={perm} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-2.5 font-medium dark:text-white text-sm">{perm}</td>
                        {roles.map(r => {
                          const rolePerms = rolePermissions[r.name] || [];
                          const has = rolePerms.includes(perm);
                          return (
                            <td key={r.id || r._id} className="px-3 py-2.5 text-center">
                              {has ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
