import React from 'react';

const BUREAU_CONFIG = {
  'Approval Bureau': {
    label: 'Approval Bureau',
    code: 'AB',
    color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  'Grievance Redressal Cell': {
    label: 'Grievance Redressal Cell',
    code: 'GRC',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  'Regulation Bureau': {
    label: 'Regulation Bureau',
    code: 'RB',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  'RIFD Bureau': {
    label: 'RIFD Bureau',
    code: 'RIFD',
    color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  'Administration & Vigilance': {
    label: 'Administration & Vigilance',
    code: 'AVC',
    color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  'Student Development Cell': {
    label: 'Student Development Cell',
    code: 'SDC',
    color: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
};

export const BureauBadge = ({ bureau, showCodeOnly = false }) => {
  const config = BUREAU_CONFIG[bureau] || {
    label: bureau,
    code: bureau || 'AICTE',
    color: 'bg-[#172846] text-slate-300 border-slate-700/80',
  };

  return (
    <span
      title={config.label}
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border font-mono ${config.color}`}
    >
      {showCodeOnly ? config.code : config.label}
    </span>
  );
};

export default BureauBadge;