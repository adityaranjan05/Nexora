import React from 'react';

export const SectionHeader = ({ title, action, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 my-2 ${className}`}>
      <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider shrink-0 select-none">
        {title}
      </h2>
      <div className="flex-1 h-[1px] bg-[#232427]" />
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
