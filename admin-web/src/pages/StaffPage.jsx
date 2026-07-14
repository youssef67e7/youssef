import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { staffAPI } from '../services/api';

const emptyForm = { name: '', email: '', password: '', role: 'pharmacist', salary: '' };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await staffAPI.list(params);
      const d = data.data || data;
      setStaff(d.staff || d.items || d || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name || '', email: s.email || '', password: '', role: s.role || 'pharmacist', salary: s.salary ?? '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (!editing && !form.password) return toast.error('Password is required');
    setSaving(true);
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : undefined };
      if (!payload.password) delete payload.password;
      if (editing) {
        await staffAPI.update(editing._id || editing.id, payload);
        toast.success('Staff updated');
      } else {
        await staffAPI.create(payload);
        toast.success('Staff created');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await staffAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Staff member deleted');
      fetchStaff();
    } catch {
      toast.error('Failed to delete staff');
    }
  };

  const toggleActive = async (s) => {
    try {
      await staffAPI.update(s._id || s.id, { isActive: !s.isActive });
      toast.success(s.isActive ? 'Staff deactivated' : 'Staff activated');
      fetchStaff();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => (
      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-600">
        {v ? v.charAt(0).toUpperCase() + v.slice(1) : '—'}
      </span>
    )},
    { key: 'salary', label: 'Salary', render: (v) => v != null ? `$${Number(v).toLocaleString()}` : '—' },
    { key: 'isActive', label: 'Status', render: (v, row) => (
      <button onClick={() => toggleActive(row)} className="flex items-center gap-1">
        {v !== false ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
        <span className={`text-xs font-medium ${v !== false ? 'text-green-600' : 'text-gray-500'}`}>{v !== false ? 'Active' : 'Inactive'}</span>
      </button>
    )},
    { key: 'actions', label: 'Actions', width: '100px', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil size={16} /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pharmacy staff members</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        emptyIcon={Users}
        emptyTitle="No staff found"
        emptyDescription="Add your first staff member"
        searchPlaceholder="Search by name..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <div>
            <label className={labelClass}>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="pharmacist">Pharmacist</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="delivery">Delivery</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Salary</label>
              <input type="number" className={inputClass} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="0" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
