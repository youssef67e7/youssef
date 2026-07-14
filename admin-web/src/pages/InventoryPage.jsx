import { useState, useEffect, useCallback } from 'react';
import { Plus, History, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { medicinesAPI } from '../services/api';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movementModal, setMovementModal] = useState(null);
  const [movementForm, setMovementForm] = useState({ quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = lowStockOnly ? await medicinesAPI.lowStock() : await medicinesAPI.list(params);
      const d = data.data || data;
      const raw = d.medicines || d.items || d || [];
      setItems(Array.isArray(raw) ? raw : []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStockOnly]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleUpdateStock = async () => {
    if (!movementForm.quantity || Number(movementForm.quantity) <= 0) return toast.error('Enter a valid quantity');
    setSaving(true);
    try {
      await medicinesAPI.updateStock(movementModal._id || movementModal.id, {
        quantity: Number(movementForm.quantity),
        type: 'restock',
        reason: movementForm.reason,
      });
      toast.success('Stock updated');
      setMovementModal(null);
      setMovementForm({ quantity: '', reason: '' });
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Medicine', render: (v) => <span className="font-medium text-gray-900">{v || '—'}</span> },
    { key: 'stock', label: 'Current Stock', sortable: true, render: (v) => {
      const stock = v ?? 0;
      return <span className={stock <= 5 ? 'text-red-600 font-semibold' : ''}>{stock}</span>;
    }},
    { key: 'category', label: 'Category', render: (v) => v?.name || v || '—' },
    { key: 'status', label: 'Status', render: (_, row) => {
      const stock = row.stock ?? 0;
      const isLow = stock <= 5;
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${isLow ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {isLow && <AlertTriangle size={12} />}
          {isLow ? 'Low Stock' : 'In Stock'}
        </span>
      );
    }},
    { key: 'actions', label: 'Actions', width: '80px', render: (_, row) => (
      <button onClick={() => { setMovementModal(row); setMovementForm({ quantity: '', reason: '' }); }} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Update stock">
        <Plus size={16} />
      </button>
    )},
  ];

  const inputClass = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage stock levels</p>
        </div>
        <button
          onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${lowStockOnly ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
        >
          <AlertTriangle size={16} /> Low Stock Only
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyIcon={Package}
        emptyTitle="No inventory items found"
        emptyDescription="Inventory will appear here once medicines are added"
        searchPlaceholder="Search by medicine name..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal open={!!movementModal} onClose={() => setMovementModal(null)} title="Update Stock" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Medicine: <span className="font-medium text-gray-900">{movementModal?.name || '—'}</span>
          </p>
          <p className="text-sm text-gray-500">
            Current Stock: <span className="font-medium text-gray-900">{movementModal?.stock ?? 0}</span>
          </p>
          <div>
            <label className={labelClass}>Add Quantity *</label>
            <input type="number" min="1" className={inputClass} value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} placeholder="Enter quantity to add" />
          </div>
          <div>
            <label className={labelClass}>Reason</label>
            <input className={inputClass} value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })} placeholder="Reason for restock" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={() => setMovementModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleUpdateStock} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
