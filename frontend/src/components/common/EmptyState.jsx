import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No Records Found',
  description = 'There are no items matching your active filter criteria.',
  icon: Icon = SearchX,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#151618] rounded-xl border border-dashed border-[#232427] text-[#F4F4F5]">
      <div className="p-3 bg-[#0F1011] border border-[#232427] rounded-full text-[#71717A] mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#F4F4F5]">{title}</h3>
      <p className="mt-1 text-xs text-[#71717A] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 rounded-lg hover:bg-[#00E676]/20 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
