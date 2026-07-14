import { useState, useEffect, useCallback } from 'react';
import { Plus, History, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { inventoryAPI } from '../services/api';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movementModal, setMovementModal] = useState(null);
  const [movementForm, setMovementForm] = useState({ type: 'restock', quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);
  const [movements, setMovements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const apiCall = lowStockOnly ? inventoryAPI.lowStock : inventoryAPI.list;
      const { data } = await apiCall(params);
      const d = data.data || data;
      setItems(d.items || d.inventory || d || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStockOnly]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleAddMovement = async () => {
    if (!movementForm.quantity || Number(movementForm.quantity) <= 0) return toast.error('Enter a valid quantity');
    setSaving(true);
    try {
      await inventoryAPI.addMovement({
        inventoryId: movementModal._id || movementModal.id,
        type: movementForm.type,
        quantity: Number(movementForm.quantity),
        reason: movementForm.reason,
      });
      toast.success('Stock updated');
      setMovementModal(null);
      setMovementForm({ type: 'restock', quantity: '', reason: '' });
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const viewHistory = async (item) => {
    setHistoryModal(item);
    setHistoryLoading(true);
    try {
      const { data } = await inventoryAPI.stockMovements(item._id || item.id);
      setMovements(data.data || data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (v) => <span className="font-medium text-gray-900">{v?.name || v || '—'}</span> },
    { key: 'currentStock', label: 'Current Stock', sortable: true },
    { key: 'minimumStock', label: 'Min Stock', render: (v) => v ?? '—' },
    { key: 'status', label: 'Status', render: (_, row) => {
      const stock = row.currentStock ?? row.quantity ?? 0;
      const min = row.minimumStock ?? row.minStock ?? 0;
      const isLow = stock <= min;
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${isLow ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {isLow && <AlertTriangle size={12} />}
          {isLow ? 'Low Stock' : 'In Stock'}
        </span>
      );
    }},
    { key: 'actions', label: 'Actions', width: '120px', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setMovementModal(row); setMovementForm({ type: 'restock', quantity: '', reason: '' }); }} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Add stock">
          <Plus size={16} />
        </button>
        <button onClick={() => viewHistory(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="History">
          <History size={16} />
        </button>
      </div>
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
          onClick={() => setLowStockOnly(!lowStockOnly)}
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
            Medicine: <span className="font-medium text-gray-900">{movementModal?.medicine?.name || movementModal?.name || '—'}</span>
          </p>
          <div>
            <label className={labelClass}>Type</label>
            <select className={inputClass} value={movementForm.type} onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}>
              <option value="restock">Restock</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Quantity *</label>
            <input type="number" min="1" className={inputClass} value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} placeholder="Enter quantity" />
          </div>
          <div>
            <label className={labelClass}>Reason</label>
            <input className={inputClass} value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })} placeholder="Reason for adjustment" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={() => setMovementModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleAddMovement} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </Modal>

      <Modal open={!!historyModal} onClose={() => { setHistoryModal(null); setMovements([]); }} title="Stock Movement History" size="lg">
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No movement history found</p>
        ) : (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {movements.map((m, i) => (
              <div key={m._id || i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mr-2 ${m.type === 'restock' || m.type === 'return' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {m.type}
                  </span>
                  <span className="text-sm text-gray-700">{m.reason || 'No reason'}</span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${m.type === 'restock' || m.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'restock' || m.type === 'return' ? '+' : '-'}{m.quantity}
                  </p>
                  <p className="text-xs text-gray-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
