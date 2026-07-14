import { useEffect, useCallback } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const variantStyles = {
  danger: {
    button: 'bg-red-600 hover:bg-red-700 text-white',
    icon: 'text-red-500 dark:text-red-400',
    IconComponent: AlertCircle,
  },
  warning: {
    button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    icon: 'text-yellow-500 dark:text-yellow-400',
    IconComponent: AlertTriangle,
  },
  primary: {
    button: 'bg-primary-600 hover:bg-primary-700 text-white',
    icon: 'text-primary-500 dark:text-primary-400',
    IconComponent: Info,
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
}) {
  const variant = variantStyles[confirmVariant] || variantStyles.danger;
  const VariantIcon = variant.IconComponent;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-start gap-4 mb-6">
          <div className={`shrink-0 mt-0.5 ${variant.icon}`}>
            <VariantIcon size={24} />
          </div>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${variant.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
