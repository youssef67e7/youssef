import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, X, ChevronUp, ChevronDown, Image, GripVertical } from 'lucide-react';
import { bannersAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { title: '', imageUrl: '', link: '', order: 0, isActive: true };

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bannersAPI.list();
      const raw = res.data?.data || res.data;
      const list = Array.isArray(raw) ? raw : (raw?.banners || raw?.data || []);
      setBanners(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load banners');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: banners.length });
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditingId(b._id || b.id);
    setForm({
      title: b.title || '',
      imageUrl: b.imageUrl || b.image || '',
      link: b.link || '',
      order: b.order ?? 0,
      isActive: b.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        title: form.title,
        imageUrl: form.imageUrl || undefined,
        link: form.link || undefined,
        order: Number(form.order),
        isActive: form.isActive,
      };
      if (editingId) {
        await bannersAPI.update(editingId, data);
        toast.success('Banner updated');
      } else {
        await bannersAPI.create(data);
        toast.success('Banner created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await bannersAPI.delete(deleteId);
      toast.success('Banner deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleMove = async (index, direction) => {
    const sorted = [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const temp = sorted[index].order;
    sorted[index].order = sorted[targetIndex].order;
    sorted[targetIndex].order = temp;
    setBanners(sorted);
    try {
      await bannersAPI.reorder(sorted.map(b => b._id || b.id));
    } catch {
      toast.error('Failed to reorder');
      load();
    }
  };

  const sortedBanners = [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        subtitle="Manage homepage banners"
        breadcrumbs={['Dashboard', 'Banners']}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            <Plus size={16} /> Add Banner
          </button>
        }
      />

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link</label>
              <input
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                placeholder="/category/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300 w-10"></th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Title</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Image</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Order</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Active</th>
              <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                Loading...
              </td></tr>
            ) : sortedBanners.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Image size={48} className="mx-auto mb-2 opacity-50" />
                No banners found
              </td></tr>
            ) : (
              sortedBanners.map((b, idx) => (
                <tr key={b._id || b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === sortedBanners.length - 1}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium dark:text-white">{b.title}</td>
                  <td className="px-5 py-3">
                    {b.imageUrl || b.image ? (
                      <img src={b.imageUrl || b.image} alt={b.title} className="h-10 w-20 object-cover rounded" />
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{b.order ?? 0}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={b.isActive !== false ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)} className="text-blue-500 hover:text-blue-700">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteId(b._id || b.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
