import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-teal-600 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-200 bg-white';
      case 'error': return 'border-rose-200 bg-white';
      case 'warning': return 'border-amber-200 bg-white';
      default: return 'border-teal-200 bg-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-3.5 rounded-lg border shadow-modal transition-all transform ease-out duration-200 ${getBorderColor(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}
          <div className="ml-3 flex-1 min-w-0">
            <h5 className="text-xs font-semibold text-slate-900">{toast.title}</h5>
            {toast.message && (
              <p className="mt-0.5 text-xs text-slate-600 leading-snug">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
