import React from 'react';
import { Layers, GitMerge } from 'lucide-react';

export const OverlapBadge = ({ severity = 'High', compact = false }) => {
  const getStyle = () => {
    switch (severity) {
      case 'High':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-semibold';
      case 'Medium':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
      default:
        return 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
    }
  };

  if (compact) {
    return (
      <span
        title={`Potential Inter-Bureau Overlap (${severity} Priority)`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border ${getStyle()}`}
      >
        <GitMerge className="w-3 h-3 text-purple-600" />
        <span>Overlap</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border ${getStyle()}`}
    >
      <Layers className="w-3.5 h-3.5 text-purple-700" />
      <span>Potential Overlap ({severity})</span>
    </span>
  );
};
