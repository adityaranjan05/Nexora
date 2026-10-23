import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5 animate-pulse" />
          Pending
        </span>
      );
    case 'Under Process':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
          Under Process
        </span>
      );
    case 'Disposed':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          Disposed
        </span>
      );
    case 'Transferred':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5" />
          Transferred
        </span>
      );
    case 'Escalated':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping" />
          Escalated
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
