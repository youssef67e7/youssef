import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

function LoadingSkeleton({ columns }) {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b dark:border-gray-700">
          {columns.map((col, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: colIdx === 0 ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
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
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSort = (key) => {
    if (!onSort) return;
    const newDirection = sortField === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (key) => {
    if (sortField !== key) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="ml-1 inline" />
    ) : (
      <ArrowDown size={14} className="ml-1 inline" />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
      {onSearch && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.sortable !== false && onSort ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                  {col.sortable !== false && renderSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <LoadingSkeleton columns={columns} />
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon || Inbox}
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
                  key={row.id ?? rowIdx}
                  className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
            {pagination.total !== undefined && ` \u00B7 ${pagination.total} total`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.totalPages <= 7) return true;
                if (p === 1 || p === pagination.totalPages) return true;
                if (Math.abs(p - pagination.page) <= 1) return true;
                return false;
              })
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => pagination.onPageChange(item)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${
                      pagination.page === item
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
