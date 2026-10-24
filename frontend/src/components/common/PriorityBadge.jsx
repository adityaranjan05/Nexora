import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
          <ArrowUp className="w-3.5 h-3.5 text-orange-600" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          {priority}
        </span>
      );
  }
};
