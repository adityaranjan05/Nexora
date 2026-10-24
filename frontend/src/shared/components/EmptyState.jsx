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
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#101D35] rounded-xl border border-dashed border-slate-700/80 text-slate-100">
      <div className="p-3 bg-[#172846] border border-slate-700/80 rounded-full text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;