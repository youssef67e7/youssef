import { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const variantStyles = {
  danger: { btn: 'bg-red-600 hover:bg-red-700 text-white', icon: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  warning: { btn: 'bg-yellow-500 hover:bg-yellow-600 text-white', icon: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  primary: { btn: 'bg-primary-600 hover:bg-primary-700 text-white', icon: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
};

const variantIcons = { danger: AlertTriangle, warning: AlertCircle, primary: Info };

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const style = variantStyles[confirmVariant] || variantStyles.danger;
  const IconComp = variantIcons[confirmVariant] || AlertTriangle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
            <IconComp size={24} className={style.icon} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${style.btn}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
