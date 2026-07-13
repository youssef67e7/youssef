import { useEffect, useState, useRef } from 'react';
import { medicinesAPI, categoriesAPI, brandsAPI } from '../services/api';
import { Plus, Trash2, Search, Edit2, X, Package, Upload, Download, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportToCSV } from '../components/ExportButton';

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'LIQUID', 'SYRUP', 'SUSPENSION', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'GEL', 'SUPPOSITORY', 'INHALER', 'PATCH', 'POWDER', 'SPRAY', 'SOLUTION', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_SPRAY', 'TOPICAL'];

const emptyForm = { name: '', nameAr: '', price: '', stockQuantity: '', category: '', sku: '', dosageForm: 'TABLET', strength: '', description: '', brand: '', isActive: true };

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);
  const perPage = 10;

  const load = async (p = page, s = search) => {
    setLoading(true);
    try {
      const [medRes, catRes, brandRes] = await Promise.allSettled([
        medicinesAPI.list({ search: s || undefined, limit: perPage, page: p }),
        categoriesAPI.list(),
        brandsAPI.list(),
      ]);
      if (medRes.status === 'fulfilled') {
        const d = medRes.value.data;
        setMedicines(d?.data || d?.medicines || []);
        setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / perPage) || 1);
      }
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.data || catRes.value.data || [];
        setCategories(Array.isArray(d) ? d : []);
      }
      if (brandRes.status === 'fulfilled') {
        const d = brandRes.value.data?.data || brandRes.value.data || [];
        setBrands(Array.isArray(d) ? d : []);
      }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => { setPage(1); load(1, searchInput); setSearch(searchInput); };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (m) => {
    setEditingId(m._id || m.id);
    setForm({
      name: m.name || '', nameAr: m.nameAr || '',
      price: m.price?.toString() || '', stockQuantity: m.stockQuantity?.toString() || m.stock?.toString() || '',
      category: m.category?._id || m.category || '', sku: m.sku || '',
      dosageForm: m.dosageForm || 'TABLET', strength: m.strength || '',
      description: m.description || '', brand: m.brand?._id || m.brand || '',
      isActive: m.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name, nameAr: form.nameAr || undefined,
        price: Number(form.price), stockQuantity: Number(form.stockQuantity),
        category: form.category, sku: form.sku,
        dosageForm: form.dosageForm, strength: form.strength,
        description: form.description, brand: form.brand || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await medicinesAPI.update(editingId, data);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(data);
        toast.success('Medicine added');
      }
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await medicinesAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selected.length === medicines.length) setSelected([]);
    else setSelected(medicines.map(m => m._id || m.id));
  };

  const handleBulkAction = async () => {
    if (selected.length === 0) return toast.error('Select items first');
    if (bulkAction === 'delete') {
      setConfirmAction(() => async () => {
        try { await medicinesAPI.bulkDelete(selected); toast.success('Deleted'); setSelected([]); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      });
      setShowConfirm(true);
    } else if (bulkAction === 'activate') {
      try { await medicinesAPI.bulkActivate(selected); toast.success('Activated'); setSelected([]); load(); }
      catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    } else if (bulkAction === 'deactivate') {
      try { await medicinesAPI.bulkDeactivate(selected); toast.success('Deactivated'); setSelected([]); load(); }
      catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    }
    setBulkAction('');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await medicinesAPI.import(fd);
      toast.success('Imported successfully');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExport = () => {
    const headers = ['Name', 'Price', 'Stock', 'SKU', 'Form', 'Category', 'Brand', 'Status'];
    const data = medicines.map(m => [m.name, m.price, m.stockQuantity ?? m.stock, m.sku, m.dosageForm, m.category?.name || m.category, m.brand?.name || m.brand, m.isActive !== false ? 'Active' : 'Inactive']);
    exportToCSV(data, headers, 'medicines');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Medicines" subtitle="Manage your medicine catalog"
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center gap-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Import
            </button>
            <button onClick={handleExport} className="flex items-center gap-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download size={14} /> Export
            </button>
            <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              <Plus size={16} /> Add Medicine
            </button>
          </>
        } />

      {selected.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 flex items-center gap-3">
          <span className="text-sm font-medium dark:text-primary-300">{selected.length} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 text-sm">
            <option value="">Bulk actions...</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
          </select>
          <button onClick={handleBulkAction} className="px-3 py-1 bg-primary-600 text-white rounded text-sm">Apply</button>
          <button onClick={() => setSelected([])} className="ml-auto text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name (EN) *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="Name (AR)" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="Price *" type="number" step="0.01" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} required placeholder="Stock *" type="number" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required placeholder="SKU *" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <input value={form.strength} onChange={e => setForm({...form, strength: e.target.value})} placeholder="Strength (e.g. 500mg)" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
            <select value={form.dosageForm} onChange={e => setForm({...form, dosageForm: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              <option value="">Select Category *</option>
              {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
            <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm col-span-2" />
            <label className="flex items-center gap-2 text-sm dark:text-gray-300"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /> Active</label>
            <div className="col-span-2 md:col-span-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="Search medicines..." />
          </div>
          <button onClick={handleSearch} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">Search</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400">
                    {selected.length === medicines.length && medicines.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Name</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Price</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Stock</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">SKU</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Form</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Category</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Brand</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : medicines.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400"><Package size={32} className="mx-auto mb-2 opacity-50" />No medicines found</td></tr>
              ) : medicines.map(m => (
                <tr key={m._id || m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(m._id || m.id)} className="text-gray-400">
                      {selected.includes(m._id || m.id) ? <CheckSquare size={16} className="text-primary-600" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium dark:text-white">
                    {m.name} {m.nameAr && <span className="text-gray-400 text-xs ml-1">({m.nameAr})</span>}
                  </td>
                  <td className="px-4 py-3 dark:text-gray-300">${m.price}</td>
                  <td className="px-4 py-3">
                    <span className={(m.stockQuantity ?? m.stock ?? 0) <= 5 ? 'text-red-600 font-medium' : 'dark:text-gray-300'}>
                      {m.stockQuantity ?? m.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.sku || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.dosageForm || '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{m.category?.name || m.category || '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{m.brand?.name || m.brand || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.isActive !== false ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(m._id || m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }}
            className="p-2 border dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); load(p); }}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
          <button disabled={page >= totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }}
            className="p-2 border dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={() => { confirmAction?.(); setShowConfirm(false); }}
        title="Delete Medicines" message={`Are you sure you want to delete ${selected.length} selected medicines? This action cannot be undone.`} />
    </div>
  );
}
