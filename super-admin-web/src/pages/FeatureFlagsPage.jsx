import { useEffect, useState } from 'react';
import { featureFlagsAPI } from '../services/api';
import { Flag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const fallbackFlags = [
  { id: '1', name: 'ai_prescription', description: 'AI-powered prescription analysis', enabled: true, rolloutPercentage: 100, targetRoles: ['admin', 'pharmacist'] },
  { id: '2', name: 'telemedicine', description: 'Video consultation feature', enabled: true, rolloutPercentage: 75, targetRoles: ['customer'] },
  { id: '3', name: 'loyalty_program', description: 'Loyalty points and rewards', enabled: false, rolloutPercentage: 0, targetRoles: ['customer'] },
  { id: '4', name: 'barcode_scanner', description: 'Medicine barcode scanning', enabled: true, rolloutPercentage: 50, targetRoles: ['pharmacist'] },
  { id: '5', name: 'dark_mode', description: 'Dark mode for mobile app', enabled: false, rolloutPercentage: 0, targetRoles: ['customer', 'driver'] },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', rolloutPercentage: 0, targetRoles: [] });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    featureFlagsAPI.list().then(res => {
      const data = res.data?.data;
      setFlags(Array.isArray(data) ? data : data?.flags || fallbackFlags);
    }).catch(() => setFlags(fallbackFlags)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try { await featureFlagsAPI.toggle(id); toast.success('Flag toggled'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleSave = async () => {
    try {
      await featureFlagsAPI.create(form); toast.success('Flag created');
      setShowForm(false); setForm({ name: '', description: '', rolloutPercentage: 0, targetRoles: [] }); load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await featureFlagsAPI.delete(deleteTarget.id || deleteTarget._id); toast.success('Deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Feature Flags" subtitle={`${flags.length} flags configured`} actions={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
          <Plus size={16} /> Add Flag
        </button>
      } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Feature</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Rollout</th>
              <th className="px-5 py-3 font-medium">Target</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              flags.map(f => (
                <tr key={f.id || f._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2"><Flag size={16} className="text-primary-500" /><span className="font-medium dark:text-white">{f.name}</span></div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{f.description}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleToggle(f.id || f._id)}>
                      {f.enabled ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${f.rolloutPercentage || 0}%` }} />
                      </div>
                      <span className="text-xs font-medium">{f.rolloutPercentage || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(f.targetRoles || []).map(r => (
                        <span key={r} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => setDeleteTarget(f)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Create Feature Flag</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Flag name (e.g. dark_mode)"
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2}
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
              <div>
                <label className="text-sm text-gray-500">Rollout: {form.rolloutPercentage}%</label>
                <input type="range" min={0} max={100} value={form.rolloutPercentage} onChange={e => setForm({...form, rolloutPercentage: Number(e.target.value)})} className="w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Create</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Feature Flag" confirmText="Delete"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
