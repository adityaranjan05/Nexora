import React from 'react';

const BUREAU_CONFIG = {
  'Approval Bureau': {
    label: 'Approval Bureau',
    code: 'AB',
    color: 'bg-indigo-50 text-indigo-700',
    border: 'border-indigo-200',
  },
  'Grievance Redressal Cell': {
    label: 'Grievance Redressal Cell',
    code: 'GRC',
    color: 'bg-teal-50 text-teal-800',
    border: 'border-teal-200',
  },
  'Regulation Bureau': {
    label: 'Regulation Bureau',
    code: 'RB',
    color: 'bg-amber-50 text-amber-800',
    border: 'border-amber-200',
  },
  'RIFD Bureau': {
    label: 'RIFD Bureau',
    code: 'RIFD',
    color: 'bg-cyan-50 text-cyan-800',
    border: 'border-cyan-200',
  },
  'Administration & Vigilance': {
    label: 'Administration & Vigilance',
    code: 'AVC',
    color: 'bg-rose-50 text-rose-800',
    border: 'border-rose-200',
  },
  'Student Development Cell': {
    label: 'Student Development Cell',
    code: 'SDC',
    color: 'bg-emerald-50 text-emerald-800',
    border: 'border-emerald-200',
  },
};

export const BureauBadge = ({ bureau, showCodeOnly = false }) => {
  const config = BUREAU_CONFIG[bureau] || {
    label: bureau,
    code: 'AICTE',
    color: 'bg-slate-50 text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      title={config.label}
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded border ${config.color} ${config.border}`}
    >
      {showCodeOnly ? config.code : config.label}
    </span>
  );
};
