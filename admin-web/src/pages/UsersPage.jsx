import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { Trash2, Edit2, Search, X, Shield, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['user', 'admin', 'pharmacy_owner', 'pharmacy_manager', 'driver', 'delivery_staff'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'user', isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.list({ search: search || undefined, limit: 50 });
      setUsers(res.data?.data || res.data?.users || []);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setEditForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || 'user', isActive: u.isActive !== false });
    setShowEdit(u._id || u.id);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await usersAPI.update(showEdit, editForm); toast.success('User updated'); setShowEdit(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await usersAPI.delete(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggleActive = async (u) => {
    try { await usersAPI.update(u._id || u.id, { isActive: !u.isActive }); toast.success(u.isActive ? 'User deactivated' : 'User activated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
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

      {showEdit && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Edit User</h2>
            <button onClick={() => setShowEdit(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleEdit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required placeholder="Name" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required placeholder="Email" type="email" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Update</button>
              <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th><th className="px-5 py-3 font-medium">Role</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              users.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr> :
                users.map(u => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700">{u.role || 'user'}</span></td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${u.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleToggleActive(u)} className={u.isActive !== false ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}>{u.isActive !== false ? <Ban size={16} /> : <CheckCircle size={16} />}</button>
                        <button onClick={() => handleDelete(u._id || u.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
