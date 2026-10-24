import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  const normalized = (status || '').toLowerCase().replace(/_/g, ' ');

  switch (normalized) {
    case 'pending':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 animate-pulse" />
          Pending
        </span>
      );
    case 'under process':
    case 'in progress':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-1.5" />
          In Progress
        </span>
      );
    case 'needs info':
    case 'need info':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
          Needs Info
        </span>
      );
    case 'disposed':
    case 'done':
    case 'closed':
    case 'resolved':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          Done / Closed
        </span>
      );
    case 'transferred':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-1.5" />
          Transferred
        </span>
      );
    case 'escalated':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
          Escalated
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-red-500/15 text-red-300 border border-red-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#172846] text-slate-300 border border-slate-700/80 capitalize ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export default StatusBadge;