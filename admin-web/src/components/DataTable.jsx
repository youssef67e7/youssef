import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, PackageOpen } from 'lucide-react';
import EmptyState from './EmptyState';

function SortIcon({ field, sortField, sortDirection }) {
  if (field !== sortField) return <ArrowUp size={14} className="text-gray-300" />;
  return sortDirection === 'asc'
    ? <ArrowUp size={14} className="text-primary-600" />
    : <ArrowDown size={14} className="text-primary-600" />;
}

function SkeletonRows({ columns }) {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: col.key === columns[0]?.key ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] h-8 text-sm font-medium rounded-lg transition ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  pagination,
  onSearch,
  searchPlaceholder = 'Search...',
  onSort,
  sortField,
  sortDirection = 'asc',
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {onSearch && (
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDirection={sortDirection} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {loading ? (
            <SkeletonRows columns={columns} />
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon || PackageOpen}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
