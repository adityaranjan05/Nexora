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
          iconBg: 'bg-slate-500/15 text-slate-300',
          borderAccent: 'border-t-2 border-t-slate-400',
          hoverBorder: 'hover:border-slate-400/60',
          tint: 'bg-[#101D35]',
        };
      case 'process':
        return {
          iconBg: 'bg-blue-500/15 text-blue-400',
          borderAccent: 'border-t-2 border-t-blue-500',
          hoverBorder: 'hover:border-blue-500/60',
          tint: 'bg-[#101D35]',
        };
      case 'disposed':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-400',
          borderAccent: 'border-t-2 border-t-emerald-500',
          hoverBorder: 'hover:border-emerald-500/60',
          tint: 'bg-[#101D35]',
        };
      case 'transferred':
        return {
          iconBg: 'bg-sky-500/15 text-sky-400',
          borderAccent: 'border-t-2 border-t-sky-500',
          hoverBorder: 'hover:border-sky-500/60',
          tint: 'bg-[#101D35]',
        };
      case 'escalated':
        return {
          iconBg: 'bg-rose-500/15 text-rose-400',
          borderAccent: 'border-t-2 border-t-rose-500',
          hoverBorder: 'hover:border-rose-500/60',
          tint: 'bg-[#101D35]',
        };
      case 'danger':
        return {
          iconBg: 'bg-red-500/15 text-red-400',
          borderAccent: 'border-t-2 border-t-red-500',
          hoverBorder: 'hover:border-red-500/60',
          tint: 'bg-red-500/10',
        };
      default:
        return {
          iconBg: 'bg-blue-500/15 text-blue-400',
          borderAccent: 'border-t-2 border-t-blue-500',
          hoverBorder: 'hover:border-blue-500/60',
          tint: 'bg-[#101D35]',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`relative ${v.tint} rounded-xl border border-slate-700/80 p-3.5 sm:p-4 transition-all duration-150  ${
        onClick ? `cursor-pointer hover:bg-[#172846] ${v.hoverBorder} hover:-translate-y-0.5` : ''
      } ${active ? 'ring-1 ring-blue-500/70 bg-[#172846]' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${v.iconBg} shrink-0`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[28px] sm:text-[30px] font-bold tracking-tight text-slate-100 font-mono leading-none">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center text-[10px] font-mono font-semibold ${
              trend.isGood ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isUpward ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {sublabel && (
        <p className="mt-1.5 text-[11px] text-slate-400 truncate font-normal" title={sublabel}>
          {sublabel}
        </p>
      )}
    </div>
  );
};

export default KpiCard;