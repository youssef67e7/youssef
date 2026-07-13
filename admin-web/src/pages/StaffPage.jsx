import { useEffect, useState } from 'react';
import { staffAPI } from '../services/api';
import { Plus, Trash2, Edit2, Search, X, Phone, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['pharmacist', 'pharmacy_technician', 'cashier', 'manager', 'delivery_staff', 'customer_service'];
const emptyForm = { name: '', email: '', phone: '', role: 'pharmacist', salary: '', joinDate: '', isActive: true };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try { const res = await staffAPI.list({ search: search || undefined }); setStaff(res.data?.data || []); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s) => { setEditingId(s._id || s.id); setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', role: s.role || 'pharmacist', salary: s.salary?.toString() || '', joinDate: s.joinDate?.slice(0,10) || '', isActive: s.isActive !== false }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, salary: form.salary ? Number(form.salary) : undefined, joinDate: form.joinDate || undefined };
      if (editingId) { await staffAPI.update(editingId, data); toast.success('Updated'); }
      else { await staffAPI.create(data); toast.success('Added'); }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove staff member?')) return;
    try { await staffAPI.delete(id); toast.success('Removed'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search staff..." />
          </div>
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">{editingId ? 'Edit Staff' : 'Add Staff'}</h2><button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name *" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="Email *" type="email" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            <input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="Salary" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} type="date" className="px-3 py-2 border rounded-lg text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th><th className="px-5 py-3 font-medium">Role</th><th className="px-5 py-3 font-medium">Salary</th><th className="px-5 py-3 font-medium">Joined</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              staff.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">No staff</td></tr> :
                staff.map(s => (
                  <tr key={s._id || s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700">{s.role?.replace(/_/g, ' ')}</span></td>
                    <td className="px-5 py-3">${s.salary?.toLocaleString() || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{s.joinDate?.slice(0,10) || '—'}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${s.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{s.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button><button onClick={() => handleDelete(s._id || s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}