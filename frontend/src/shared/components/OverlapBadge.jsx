import React from 'react';
import { Layers, GitMerge } from 'lucide-react';

export const OverlapBadge = ({ severity = 'High', compact = false }) => {
  const getStyle = () => {
    switch (severity) {
      case 'High':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium';
      case 'Low':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30 font-medium';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium';
    }
  };

  if (compact) {
    return (
      <span
        title={`Cross-Bureau Overlap (${severity})`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] border ${getStyle()}`}
      >
        <GitMerge className="w-3 h-3" />
        <span>Overlap</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border ${getStyle()}`}
    >
      <Layers className="w-3.5 h-3.5" />
      <span>Overlap ({severity})</span>
    </span>
  );
};

export default OverlapBadge;