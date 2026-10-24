import React from 'react';

const BUREAU_CONFIG = {
  'Approval Bureau': {
    label: 'Approval Bureau',
    code: 'AB',
    color: 'bg-[#6C7BFF]/15 text-[#6C7BFF] border-[#6C7BFF]/30',
  },
  'Grievance Redressal Cell': {
    label: 'Grievance Redressal Cell',
    code: 'GRC',
    color: 'bg-[#19D3A2]/15 text-[#19D3A2] border-[#19D3A2]/30',
  },
  'Regulation Bureau': {
    label: 'Regulation Bureau',
    code: 'RB',
    color: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  },
  'RIFD Bureau': {
    label: 'RIFD Bureau',
    code: 'RIFD',
    color: 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30',
  },
  'Administration & Vigilance': {
    label: 'Administration & Vigilance',
    code: 'AVC',
    color: 'bg-[#FF4D79]/15 text-[#FF4D79] border-[#FF4D79]/30',
  },
  'Student Development Cell': {
    label: 'Student Development Cell',
    code: 'SDC',
    color: 'bg-[#B07CFF]/15 text-[#B07CFF] border-[#B07CFF]/30',
  },
};

export const BureauBadge = ({ bureau, showCodeOnly = false }) => {
  const config = BUREAU_CONFIG[bureau] || {
    label: bureau,
    code: bureau || 'AICTE',
    color: 'bg-[#1F2023] text-[#A1A1AA] border-[#232427]',
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
