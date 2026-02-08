import { useEffect, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  addToastFn?.(message, type);
}

export function toastError(message: string) {
  toast(message, 'error');
}

export function toastSuccess(message: string) {
  toast(message, 'success');
}

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

const styles = {
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2 p-3 rounded-lg border shadow-lg animate-fade-in ${styles[t.type]}`}
          >
            <Icon size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
