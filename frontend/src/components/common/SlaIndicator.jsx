import React from 'react';
import { Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const SlaIndicator = ({ slaStatus, daysRemaining, expectedDate }) => {
  if (slaStatus === 'Beyond Timeline' || daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30">
        <AlertOctagon className="w-3 h-3 text-[#FF5C5C]" />
        <span className="font-mono">Overdue {overdueDays > 0 ? `${overdueDays}d` : ''}</span>
      </div>
    );
  }

  if (slaStatus === 'Due Soon' || (daysRemaining > 0 && daysRemaining <= 5)) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
        <Clock className="w-3 h-3 text-[#F59E0B]" />
        <span className="font-mono">{daysRemaining}d left</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#19D3A2]/15 text-[#19D3A2] border border-[#19D3A2]/30">
      <CheckCircle2 className="w-3 h-3 text-[#19D3A2]" />
      <span className="font-mono">{daysRemaining > 0 ? `${daysRemaining}d left` : 'On track'}</span>
    </div>
  );
};

export default SlaIndicator;
