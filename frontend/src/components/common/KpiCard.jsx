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
          iconBg: 'bg-[#8A99B5]/15 text-[#8A99B5]',
          borderAccent: 'border-t-2 border-t-[#8A99B5]',
          hoverBorder: 'hover:border-[#8A99B5]/60',
          tint: 'bg-[#151618]',
        };
      case 'process':
        return {
          iconBg: 'bg-[#6C7BFF]/15 text-[#6C7BFF]',
          borderAccent: 'border-t-2 border-t-[#6C7BFF]',
          hoverBorder: 'hover:border-[#6C7BFF]/60',
          tint: 'bg-[#151618]',
        };
      case 'disposed':
        return {
          iconBg: 'bg-[#19D3A2]/15 text-[#19D3A2]',
          borderAccent: 'border-t-2 border-t-[#19D3A2]',
          hoverBorder: 'hover:border-[#19D3A2]/60',
          tint: 'bg-[#151618]',
        };
      case 'transferred':
        return {
          iconBg: 'bg-[#B07CFF]/15 text-[#B07CFF]',
          borderAccent: 'border-t-2 border-t-[#B07CFF]',
          hoverBorder: 'hover:border-[#B07CFF]/60',
          tint: 'bg-[#151618]',
        };
      case 'escalated':
        return {
          iconBg: 'bg-[#FF4D79]/15 text-[#FF4D79]',
          borderAccent: 'border-t-2 border-t-[#FF4D79]',
          hoverBorder: 'hover:border-[#FF4D79]/60',
          tint: 'bg-[#151618]',
        };
      case 'danger':
        return {
          iconBg: 'bg-[#FF5C5C]/20 text-[#FF5C5C]',
          borderAccent: 'border-t-2 border-t-[#FF5C5C]',
          hoverBorder: 'hover:border-[#FF5C5C]/60',
          tint: 'bg-[#FF5C5C]/[0.08]',
        };
      default:
        return {
          iconBg: 'bg-[#00E676]/15 text-[#00E676]',
          borderAccent: 'border-t-2 border-t-[#00E676]',
          hoverBorder: 'hover:border-[#00E676]/60',
          tint: 'bg-[#151618]',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`relative ${v.tint} rounded-xl border border-[#232427] p-3.5 sm:p-4 transition-all duration-150 ${v.borderAccent} ${
        onClick ? `cursor-pointer hover:bg-[#1A1B1E] ${v.hoverBorder} hover:-translate-y-0.5` : ''
      } ${active ? 'ring-1 ring-[#00E676] bg-[#1A1B1E]' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider truncate">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${v.iconBg} shrink-0`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#F4F4F5] font-mono leading-none">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center text-[10px] font-mono font-semibold ${
              trend.isGood ? 'text-[#19D3A2]' : 'text-[#FF4D79]'
            }`}
          >
            {trend.isUpward ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {sublabel && (
        <p className="mt-1.5 text-[11px] text-[#71717A] truncate font-normal" title={sublabel}>
          {sublabel}
        </p>
      )}
    </div>
  );
};

export default KpiCard;
