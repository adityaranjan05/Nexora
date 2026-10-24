import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />;
      case 'error':
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-[#FF4D79] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[#6C7BFF] shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-[#00E676]/30 bg-[#151618]';
      case 'error':
      case 'danger': return 'border-[#FF4D79]/30 bg-[#151618]';
      case 'warning': return 'border-[#F59E0B]/30 bg-[#151618]';
      default: return 'border-[#6C7BFF]/30 bg-[#151618]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-2xl transition-all transform ease-out duration-200 ${getBorderColor(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}
          <div className="ml-3 flex-1 min-w-0">
            <h5 className="text-xs font-semibold text-[#F4F4F5]">{toast.title}</h5>
            {toast.message && (
              <p className="mt-0.5 text-xs text-[#A1A1AA] leading-snug">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-[#71717A] hover:text-[#F4F4F5] p-0.5 rounded transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
