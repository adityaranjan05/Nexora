import React from 'react';

export const SectionHeader = ({ title, action, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 my-2 ${className}`}>
      <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider shrink-0 select-none">
        {title}
      </h2>
      <div className="flex-1 h-[1px] bg-slate-700/80" />
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;