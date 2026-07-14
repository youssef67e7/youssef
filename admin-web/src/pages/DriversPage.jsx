import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Truck, Star, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { driversAPI } from '../services/api';

const emptyForm = { name: '', email: '', phone: '', vehicleType: 'MOTORCYCLE', licenseNumber: '' };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
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
  const [earningsModal, setEarningsModal] = useState(null);
  const [earningsData, setEarningsData] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await driversAPI.list(params);
      const d = data?.data || data;
      const list = Array.isArray(d) ? d : (d?.drivers || d?.data || []);
      setDrivers(Array.isArray(list) ? list : []);
      setTotalPages(d?.totalPages || d?.meta?.totalPages || 1);
      setTotal(d?.total || d?.meta?.total || list.length || 0);
    } catch { toast.error('Failed to load drivers'); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name || '', email: d.email || '', phone: d.phone || '', vehicleType: d.vehicleType || 'MOTORCYCLE', licenseNumber: d.licenseNumber || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.phone.trim()) return toast.error('Phone is required');
    setSaving(true);
    try {
      if (editing) {
        await driversAPI.update(editing._id || editing.id, form);
        toast.success('Driver updated');
      } else {
        await driversAPI.create(form);
        toast.success('Driver created');
      }
      setModalOpen(false); fetchDrivers();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await driversAPI.delete(deleteTarget._id || deleteTarget.id); toast.success('Driver deleted'); fetchDrivers(); }
    catch { toast.error('Failed to delete driver'); }
  };

  const toggleOnline = async (d) => {
    try {
      await driversAPI.setOnline(d._id || d.id, !d.isOnline);
      toast.success(d.isOnline ? 'Set offline' : 'Set online');
      fetchDrivers();
    } catch { toast.error('Failed to toggle status'); }
  };

  const viewEarnings = async (d) => {
    setEarningsModal(d); setEarningsData(null);
    try {
      const { data } = await driversAPI.earnings(d._id || d.id);
      setEarningsData(data?.data || data);
    } catch { toast.error('Failed to load earnings'); }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'vehicleType', label: 'Vehicle', render: (v) => <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{v || '—'}</span> },
    { key: 'isOnline', label: 'Status', render: (v, row) => (
      <button onClick={() => toggleOnline(row)} className="flex items-center gap-1">
        {v ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
        <span className={`text-xs font-medium ${v ? 'text-green-600' : 'text-gray-500'}`}>{v ? 'Online' : 'Offline'}</span>
      </button>
    )},
    { key: 'rating', label: 'Rating', render: (v) => (
      <div className="flex items-center gap-1">
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="text-sm">{v?.toFixed(1) || '0.0'}</span>
      </div>
    )},
    { key: 'totalDeliveries', label: 'Deliveries', render: (v) => v ?? 0 },
    { key: 'actions', label: 'Actions', width: '120px', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => viewEarnings(row)} className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition" title="Earnings"><DollarSign size={15} /></button>
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
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery drivers</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Driver
        </button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        loading={loading}
        emptyIcon={Truck}
        emptyTitle="No drivers found"
        emptyDescription="Add your first driver"
        searchPlaceholder="Search by name..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+20..." />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select className={inputClass} value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="CAR">Car</option>
                <option value="VAN">Van</option>
                <option value="BICYCLE">Bicycle</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>License Number</label>
              <input className={inputClass} value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="D-1234" />
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

      <Modal open={!!earningsModal} onClose={() => { setEarningsModal(null); setEarningsData(null); }} title={`Earnings — ${earningsModal?.name || ''}`}>
        {earningsData ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(earningsData).map(([key, val]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="font-medium text-gray-900">{typeof val === 'number' ? `$${val.toLocaleString()}` : String(val ?? '—')}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-4">Loading...</p>}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Driver" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
