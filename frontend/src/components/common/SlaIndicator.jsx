import React from 'react';
import { Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const SlaIndicator = ({ slaStatus, daysRemaining, expectedDate }) => {
  if (slaStatus === 'Beyond Timeline' || daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        <AlertOctagon className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        <span>Overdue by {overdueDays}d</span>
      </div>
    );
  }

  if (slaStatus === 'Due Soon' || daysRemaining <= 5) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Due in {daysRemaining}d</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>{daysRemaining > 0 ? `${daysRemaining}d left` : 'On track'}</span>
    </div>
  );
};
