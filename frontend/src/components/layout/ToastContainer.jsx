import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-300 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-blue-400/30 bg-[#101D35]';
      case 'error': return 'border-rose-400/30 bg-[#101D35]';
      case 'warning': return 'border-amber-400/30 bg-[#101D35]';
      default: return 'border-blue-400/25 bg-[#101D35]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-modal transition-all transform ease-out duration-200 backdrop-blur-sm ${getBorderColor(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}
          <div className="ml-3 flex-1 min-w-0">
            <h5 className="text-xs font-semibold text-slate-100">{toast.title}</h5>
            {toast.message && (
              <p className="mt-0.5 text-xs text-slate-300 leading-snug">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
