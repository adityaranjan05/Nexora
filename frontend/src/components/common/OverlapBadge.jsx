import React from 'react';
import { Layers, GitMerge } from 'lucide-react';

export const OverlapBadge = ({ severity = 'High', compact = false }) => {
  const getStyle = () => {
    switch (severity) {
      case 'High':
        return 'bg-[#FF4D79]/20 text-[#FF4D79] border-[#FF4D79]/40 font-semibold';
      case 'Medium':
        return 'bg-[#B07CFF]/20 text-[#B07CFF] border-[#B07CFF]/40 font-medium';
      case 'Low':
        return 'bg-[#8A99B5]/20 text-[#8A99B5] border-[#8A99B5]/40 font-medium';
      default:
        return 'bg-[#B07CFF]/20 text-[#B07CFF] border-[#B07CFF]/40 font-medium';
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
