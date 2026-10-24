import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30">
          <ArrowUp className="w-3.5 h-3.5 text-orange-400" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-500/15 text-slate-300 border border-slate-500/30">
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-[#172846] text-slate-300 border border-slate-700/80">
          {priority}
        </span>
      );
  }
};