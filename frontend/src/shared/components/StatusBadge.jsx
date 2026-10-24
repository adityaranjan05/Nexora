import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  const normalized = (status || '').toLowerCase().replace(/_/g, ' ');

  switch (normalized) {
    case 'pending':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#8A99B5]/15 text-[#8A99B5] border border-[#8A99B5]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A99B5] mr-1.5 animate-pulse" />
          Pending
        </span>
      );
    case 'under process':
    case 'in progress':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#6C7BFF]/15 text-[#6C7BFF] border border-[#6C7BFF]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C7BFF] mr-1.5" />
          In Progress
        </span>
      );
    case 'needs info':
    case 'need info':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-1.5" />
          Needs Info
        </span>
      );
    case 'disposed':
    case 'done':
    case 'closed':
    case 'resolved':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] mr-1.5" />
          Done / Closed
        </span>
      );
    case 'transferred':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#B07CFF]/15 text-[#B07CFF] border border-[#B07CFF]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B07CFF] mr-1.5" />
          Transferred
        </span>
      );
    case 'escalated':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-[#FF4D79]/15 text-[#FF4D79] border border-[#FF4D79]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D79] mr-1.5" />
          Escalated
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mr-1.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-[#1F2023] text-[#A1A1AA] border border-[#232427] capitalize ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export default StatusBadge;
