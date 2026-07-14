import { useEffect, useState } from 'react';
import { driversAPI } from '../services/api';
import { Plus, Trash2, Edit2, X, Truck, Star, Phone, Mail, Loader2, DollarSign, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { name: '', phone: '', email: '', password: '', isOnline: false };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const [earningsData, setEarningsData] = useState(null);
  const [earningsDriver, setEarningsDriver] = useState(null);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [deliveriesData, setDeliveriesData] = useState([]);
  const [deliveriesDriver, setDeliveriesDriver] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await driversAPI.list();
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.drivers || raw?.data || []);
      setDrivers(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to load drivers'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (d) => {
    setEditingId(d._id || d.id);
    setForm({ name: d.name || '', phone: d.phone || '', email: d.email || '', password: '', isOnline: d.isOnline || false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, phone: form.phone, email: form.email || undefined };
      if (form.password) data.password = form.password;
      if (editingId) {
        if (!form.password) delete data.password;
        await driversAPI.update(editingId, data);
        toast.success('Updated');
      } else {
        data.password = form.password || 'temp1234';
        await driversAPI.create(data);
        toast.success('Created');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await driversAPI.delete(deleteId); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowConfirm(false); setDeleteId(null);
  };

  const toggleOnline = async (d) => {
    try {
      await driversAPI.setOnline(d._id || d.id, !d.isOnline);
      toast.success(d.isOnline ? 'Set offline' : 'Set online');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewEarnings = async (d) => {
    setEarningsDriver(d);
    setShowEarnings(true);
    try {
      const res = await driversAPI.earnings(d._id || d.id);
      setEarningsData(res.data?.data || res.data);
    } catch { toast.error('Failed to load earnings'); }
  };

  const viewDeliveries = async (d) => {
    setDeliveriesDriver(d);
    setShowDeliveries(true);
    try {
      const res = await driversAPI.deliveries(d._id || d.id, { limit: 50 });
      const data = res.data?.data || res.data || [];
      setDeliveriesData(Array.isArray(data) ? data : data?.deliveries || []);
    } catch { toast.error('Failed to load deliveries'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Drivers" subtitle="Manage delivery drivers"
        actions={
          <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Driver
          </button>
        } />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Driver' : 'Add Driver'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Full Name *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="Phone *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? 'New Password (optional)' : 'Password *'} type="password" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <div className="flex gap-2 col-span-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Phone</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Email</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Rating</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Deliveries</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Truck size={32} className="mx-auto mb-2 opacity-50" />No drivers found</td></tr>
              ) : drivers.map(d => (
                <tr key={d._id || d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{d.name}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{d.phone || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{d.email || '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={d.isOnline ? 'online' : 'offline'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 dark:text-gray-300">
                      <Star size={14} className="text-yellow-500" fill="currentColor" />
                      {d.rating?.toFixed(1) || d.averageRating?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td className="px-5 py-3 dark:text-gray-300">{d.totalDeliveries ?? d.deliveriesCount ?? 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleOnline(d)} className={d.isOnline ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} title={d.isOnline ? 'Set Offline' : 'Set Online'}>
                        {d.isOnline ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                      <button onClick={() => openEdit(d)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => viewEarnings(d)} className="text-green-500 hover:text-green-700" title="Earnings"><DollarSign size={16} /></button>
                      <button onClick={() => viewDeliveries(d)} className="text-purple-500 hover:text-purple-700" title="Deliveries"><Package size={16} /></button>
                      <button onClick={() => { setDeleteId(d._id || d.id); setShowConfirm(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEarnings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Earnings — {earningsDriver?.name}</h3>
              <button onClick={() => { setShowEarnings(false); setEarningsData(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {earningsData ? (
              <div className="space-y-3">
                {typeof earningsData === 'object' && !Array.isArray(earningsData) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(earningsData).map(([key, val]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-medium dark:text-white">{typeof val === 'number' ? `$${val.toLocaleString()}` : String(val)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">{JSON.stringify(earningsData, null, 2)}</pre>
                )}
              </div>
            ) : <Loader2 size={20} className="animate-spin mx-auto text-gray-400" />}
          </div>
        </div>
      )}

      {showDeliveries && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Deliveries — {deliveriesDriver?.name}</h3>
              <button onClick={() => { setShowDeliveries(false); setDeliveriesData([]); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {deliveriesData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No deliveries found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <tr>
                      <th className="pb-2 font-medium">Order #</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {deliveriesData.map((d, i) => (
                      <tr key={d._id || d.id || i}>
                        <td className="py-2 dark:text-white">{d.orderNumber || d._id?.slice(-8) || '—'}</td>
                        <td className="py-2"><StatusBadge status={d.status} /></td>
                        <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog open={showConfirm} onClose={() => { setShowConfirm(false); setDeleteId(null); }}
        onConfirm={handleDelete} title="Delete Driver" message="Are you sure you want to delete this driver? This action cannot be undone." />
    </div>
  );
}
