import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { couponsAPI } from '../services/api';

const emptyForm = {
  code: '', name: '', discountValue: '', discountType: 'percentage',
  minOrderAmount: '', maxUses: '', startDate: '', endDate: '', isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await couponsAPI.list();
      const d = data.data || data;
      const list = d.coupons || d.items || d || [];
      if (search) {
        const q = search.toLowerCase();
        setCoupons(list.filter((c) => (c.code || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)));
      } else {
        setCoupons(list);
      }
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || '', name: c.name || '', discountValue: c.discountValue ?? '',
      discountType: c.discountType || 'percentage', minOrderAmount: c.minOrderAmount ?? '',
      maxUses: c.maxUses ?? '', startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '', isActive: c.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error('Code is required');
    if (!form.discountValue || Number(form.discountValue) <= 0) return toast.error('Discount value must be greater than 0');
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined, maxUses: form.maxUses ? Number(form.maxUses) : undefined };
      if (editing) {
        await couponsAPI.update(editing._id || editing.id, payload);
        toast.success('Coupon updated');
      } else {
        await couponsAPI.create(payload);
        toast.success('Coupon created');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await couponsAPI.delete(deleteTarget._id || deleteTarget.id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleActive = async (c) => {
    try {
      await couponsAPI.update(c._id || c.id, { isActive: !c.isActive });
      toast.success(c.isActive ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono font-medium text-gray-900">{v}</span> },
    { key: 'name', label: 'Name' },
    { key: 'discountValue', label: 'Discount', render: (v, row) => `${v}${row.discountType === 'percentage' ? '%' : ''}` },
    { key: 'discountType', label: 'Type', render: (v) => (
      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-600">{v}</span>
    )},
    { key: 'minOrderAmount', label: 'Min Order', render: (v) => v ? `$${v}` : '—' },
    { key: 'maxUses', label: 'Max Uses', render: (v) => v ?? '∞' },
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
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyIcon={Ticket}
        emptyTitle="No coupons found"
        emptyDescription="Create your first coupon to offer discounts"
        searchPlaceholder="Search by code or name..."
        onSearch={setSearch}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Code *</label>
              <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Coupon name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Discount Value *</label>
              <input type="number" min="0" className={inputClass} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Discount Type</label>
              <select className={inputClass} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Order Amount</label>
              <input type="number" min="0" className={inputClass} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Max Uses</label>
              <input type="number" min="0" className={inputClass} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
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
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deleteTarget?.code}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
