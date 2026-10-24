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
          accent: 'border-l-slate-400',
          hoverBorder: 'hover:border-slate-400/60',
        };

      case 'process':
        return {
          iconBg: 'bg-blue-500/15 text-blue-300',
          accent: 'border-l-blue-400',
          hoverBorder: 'hover:border-blue-400/60',
        };

      case 'disposed':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-300',
          accent: 'border-l-emerald-400',
          hoverBorder: 'hover:border-emerald-400/60',
        };

      case 'transferred':
        return {
          iconBg: 'bg-purple-500/15 text-purple-300',
          accent: 'border-l-purple-400',
          hoverBorder: 'hover:border-purple-400/60',
        };

      case 'escalated':
        return {
          iconBg: 'bg-rose-500/15 text-rose-300',
          accent: 'border-l-rose-400',
          hoverBorder: 'hover:border-rose-400/60',
        };

      case 'danger':
        return {
          iconBg: 'bg-rose-500/15 text-rose-300',
          accent: 'border-l-rose-500',
          hoverBorder: 'hover:border-rose-400/70',
        };

      default:
        return {
          iconBg: 'bg-teal-400/15 text-teal-300',
          accent: 'border-l-teal-400',
          hoverBorder: 'hover:border-teal-400/60',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl border border-[#294158]
        border-l-4 ${v.accent}
        bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728]
        p-4 shadow-lg shadow-black/10
        transition-all duration-200
        ${onClick
          ? `cursor-pointer ${v.hoverBorder} hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20`
          : ''
        }
        ${active
          ? 'ring-1 ring-teal-400/60 border-teal-400/50'
          : ''
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>

        {Icon && (
          <div className={`shrink-0 rounded-lg p-2 ${v.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-2xl font-bold tracking-tight text-slate-100">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex shrink-0 items-center text-xs font-medium ${
              trend.isGood
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {trend.isUpward ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {sublabel && (
        <p
          className="mt-1 truncate text-xs text-slate-400"
          title={sublabel}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
};

export default KpiCard;