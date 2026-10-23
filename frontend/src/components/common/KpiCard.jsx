import React from 'react';

export const KpiCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  variant = 'default',
  trend,
  onClick,
  active = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pending':
        return {
          iconBg: 'bg-slate-100 text-slate-700',
          accent: 'border-l-slate-400',
          hoverBg: 'hover:border-slate-400',
        };
      case 'process':
        return {
          iconBg: 'bg-blue-50 text-blue-700',
          accent: 'border-l-blue-600',
          hoverBg: 'hover:border-blue-400',
        };
      case 'disposed':
        return {
          iconBg: 'bg-emerald-50 text-emerald-700',
          accent: 'border-l-emerald-600',
          hoverBg: 'hover:border-emerald-400',
        };
      case 'transferred':
        return {
          iconBg: 'bg-purple-50 text-purple-700',
          accent: 'border-l-purple-600',
          hoverBg: 'hover:border-purple-400',
        };
      case 'escalated':
        return {
          iconBg: 'bg-rose-50 text-rose-700',
          accent: 'border-l-rose-600',
          hoverBg: 'hover:border-rose-400',
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100 text-red-800',
          accent: 'border-l-red-600',
          hoverBg: 'hover:border-red-500',
        };
      default:
        return {
          iconBg: 'bg-teal-50 text-teal-800',
          accent: 'border-l-teal-600',
          hoverBg: 'hover:border-teal-400',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-lg border border-slate-200/90 p-4 transition-all duration-150 border-l-4 ${v.accent} ${
        onClick ? `cursor-pointer ${v.hoverBg} hover:shadow-subtle` : ''
      } ${active ? 'ring-2 ring-teal-500 ring-offset-1 bg-teal-50/20' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide truncate">
          {label}
        </span>
        <div className={`p-1.5 rounded-md ${v.iconBg} shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center text-xs font-medium ${
              trend.isGood ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {trend.isUpward ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {sublabel && (
        <p className="mt-1 text-xs text-slate-500 truncate" title={sublabel}>
          {sublabel}
        </p>
      )}
    </div>
  );
};
