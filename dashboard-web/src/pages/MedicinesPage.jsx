import { useEffect, useState, useCallback } from 'react';
import { medicinesAPI } from '../services/api';
import { Package, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [detailMed, setDetailMed] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const params = { limit: 15, page: p };
      if (s) params.search = s;

      const res = await medicinesAPI.list(params);
      const raw = res.data;
      const d = raw?.data || raw;
      const list = d?.medicines || (Array.isArray(d) ? d : []);
      setMedicines(Array.isArray(list) ? list : []);
      setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / 15) || 1);
      setTotal(d?.total || 0);
    } catch {
      toast.error('Failed to load medicines');
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    load(1, val);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v, row) => (
      <div>
        <span className="font-medium dark:text-white">{v || '—'}</span>
        {row.nameAr && <span className="text-gray-400 text-xs ml-1">({row.nameAr})</span>}
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => (
      <span className="dark:text-gray-300">{v?.name || v || '—'}</span>
    )},
    { key: 'price', label: 'Price', render: (v) => (
      <span className="font-medium dark:text-white">${v || 0}</span>
    )},
    { key: 'stockQuantity', label: 'Stock', render: (v, row) => {
      const stock = v ?? row.stock ?? 0;
      return (
        <span className={stock <= 5 ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-gray-300'}>
          {stock}
        </span>
      );
    }},
    { key: 'isActive', label: 'Status', render: (v) => (
      <StatusBadge status={v !== false ? 'active' : 'inactive'} />
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <button
        onClick={() => { setDetailMed(row); setShowDetail(true); }}
        className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        title="View Details"
      >
        <Info size={15} />
      </button>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Medicines" subtitle="Browse medicine catalog" />

      <DataTable
        columns={columns}
        data={medicines}
        loading={loading}
        emptyIcon={Package}
        emptyTitle="No medicines found"
        emptyDescription="No medicines match your search criteria."
        onSearch={handleSearch}
        searchPlaceholder="Search medicines by name..."
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: (p) => { setPage(p); load(p); },
        }}
      />

      <Modal open={showDetail} onClose={() => { setShowDetail(false); setDetailMed(null); }} title="Medicine Details" size="md">
        {detailMed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="font-medium dark:text-white">{detailMed.name || '—'}</p>
                {detailMed.nameAr && <p className="text-sm text-gray-500 dark:text-gray-400">{detailMed.nameAr}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <StatusBadge status={detailMed.isActive !== false ? 'active' : 'inactive'} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                <p className="font-medium dark:text-white">${detailMed.price || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</p>
                <p className={`font-medium ${(detailMed.stockQuantity ?? detailMed.stock ?? 0) <= 5 ? 'text-red-600 dark:text-red-400' : 'dark:text-white'}`}>
                  {detailMed.stockQuantity ?? detailMed.stock ?? 0} units
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SKU</p>
                <p className="dark:text-gray-300">{detailMed.sku || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dosage Form</p>
                <p className="dark:text-gray-300">{detailMed.dosageForm?.replace(/_/g, ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Strength</p>
                <p className="dark:text-gray-300">{detailMed.strength || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                <p className="dark:text-gray-300">{detailMed.category?.name || detailMed.category || '—'}</p>
              </div>
              {detailMed.brand && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Brand</p>
                  <p className="dark:text-gray-300">{detailMed.brand?.name || detailMed.brand}</p>
                </div>
              )}
              {detailMed.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-sm dark:text-gray-300">{detailMed.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
