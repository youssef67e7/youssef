import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { Trash2, Edit, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.list({ search: search || undefined, limit: 50 });
      setUsers(res.data?.data || res.data?.users || []);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await usersAPI.delete(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search users..." />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th><th className="px-5 py-3 font-medium">Role</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              users.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr> :
                users.map(u => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700">{u.role || 'user'}</span></td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(u._id || u.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
