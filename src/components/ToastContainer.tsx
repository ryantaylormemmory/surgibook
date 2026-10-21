import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastCounter = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function emit() {
  listeners.forEach(l => l([...toasts]));
}

export function showToast(message: string, type: ToastType = 'info') {
  const toast: Toast = { id: `toast-${++toastCounter}`, message, type };
  toasts = [toast, ...toasts].slice(0, 5);
  emit();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== toast.id);
    emit();
  }, 4000);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-green-500" />,
  error: <AlertCircle size={16} className="text-red-500" />,
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  info: <Info size={16} className="text-blue-500" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

export default function ToastContainer() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.push(setList);
    return () => { const i = listeners.indexOf(setList); if (i >= 0) listeners.splice(i, 1); };
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[90] space-y-2 w-full max-w-sm">
      {list.map(t => (
        <div
          key={t.id}
          className={`bg-white border border-gray-200 border-l-4 ${borders[t.type]} rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-in slide-in-from-right-full fade-in duration-300`}
        >
          {icons[t.type]}
          <p className="text-sm text-gray-700 flex-1">{t.message}</p>
          <button onClick={() => { toasts = toasts.filter(x => x.id !== t.id); emit(); }} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
