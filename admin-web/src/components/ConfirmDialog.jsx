import { useEffect, useCallback } from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

const variants = {
  danger:  { icon: Trash2,      btnBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-300',   iconColor: 'text-red-600',   iconBg: 'bg-red-50' },
  warning: { icon: AlertTriangle,btnBg: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300', iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50' },
  primary: { icon: Info,         btnBg: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300', iconColor: 'text-primary-600', iconBg: 'bg-primary-50' },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
}) {
  const v = variants[confirmVariant] || variants.danger;
  const Icon = v.icon;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${v.iconBg}`}>
          <Icon size={24} className={v.iconColor} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition focus:outline-none focus:ring-2 ${v.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
