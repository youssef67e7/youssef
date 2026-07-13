import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { Eye, Pause, Play, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusIndicator from '../components/StatusIndicator';
import RoleBadge from '../components/RoleBadge';
import UserAvatar from '../components/UserAvatar';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const fallbackUsers = [
  { id: '1', name: 'Ahmed Hassan', email: 'ahmed@pharmaworld.com', phone: '+1234567890', role: 'super_admin', status: 'active', branchName: null, lastActive: new Date(Date.now() - 300000) },
  { id: '2', name: 'Sara Johnson', email: 'sara@pharmaworld.com', phone: '+1234567891', role: 'admin', status: 'active', branchName: null, lastActive: new Date(Date.now() - 1800000) },
  { id: '3', name: 'Mohamed Ali', email: 'mohamed@pharmaworld.com', phone: '+1234567892', role: 'pharmacy_owner', status: 'active', branchName: 'Central', lastActive: new Date(Date.now() - 3600000) },
  { id: '4', name: 'Emily Brown', email: 'emily@pharmaworld.com', phone: '+1234567893', role: 'pharmacy_manager', status: 'active', branchName: 'North', lastActive: new Date(Date.now() - 7200000) },
  { id: '5', name: 'Omar Wilson', email: 'omar@driver.com', phone: '+1234567894', role: 'driver', status: 'active', branchName: null, lastActive: new Date(Date.now() - 900000) },
  { id: '6', name: 'Fatima Davis', email: 'fatima@customer.com', phone: '+1234567895', role: 'customer', status: 'suspended', branchName: null, lastActive: new Date(Date.now() - 259200000) },
];

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
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const load = () => {
    usersAPI.list({ role: roleFilter !== 'All' ? roleFilter : undefined, search: search || undefined })
      .then(res => {
        const data = res.data?.data;
        setUsers(Array.isArray(data) ? data : data?.users || fallbackUsers);
      })
      .catch(() => setUsers(fallbackUsers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const roles = ['All', ...new Set(users.map(u => u.role))];

  const handleToggle = async (id) => {
    try { await usersAPI.toggle(id); toast.success('User toggled'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Users" subtitle={`${users.length} total users`} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="flex-1 px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
            {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Branch</th>
              <th className="px-5 py-3 font-medium">Last Active</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              filtered.map(u => (
                <tr key={u.id || u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.name} size={32} />
                      <div>
                        <p className="font-medium dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3"><StatusIndicator status={u.status === 'suspended' ? 'inactive' : u.status} /></td>
                  <td className="px-5 py-3 text-gray-500">{u.branchName || '-'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{timeAgo(u.lastActive)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(u)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Eye size={16} /></button>
                      <button onClick={() => handleToggle(u.id || u._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        {u.status === 'active' ? <Pause size={16} className="text-orange-500" /> : <Play size={16} className="text-green-500" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar name={detail.name} size={64} />
              <div>
                <h3 className="text-lg font-bold dark:text-white">{detail.name}</h3>
                <p className="text-gray-500">{detail.email}</p>
                <RoleBadge role={detail.role} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[['Phone', detail.phone], ['Status', detail.status], ['Branch', detail.branchName || 'N/A'],
                ['Last Active', timeAgo(detail.lastActive)]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b dark:border-gray-700">
                  <span className="text-gray-500">{k}</span><span className="font-medium dark:text-white">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetail(null)} className="mt-4 w-full py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
