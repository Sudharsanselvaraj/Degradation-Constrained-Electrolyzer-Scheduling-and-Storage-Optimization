import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "rose" | "blue" | "slate" | "purple";
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  badge,
  badgeColor = "emerald",
  icon,
  className = "",
}) => {
  const badgeClasses = {
    emerald: "bg-[#09342B]/8 text-[#09342B] border-[#09342B]/20",
    amber: "bg-amber-500/10 text-amber-800 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-800 border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-800 border-purple-500/30",
    blue: "bg-blue-500/10 text-blue-800 border-blue-500/30",
    slate: "bg-[#EDEDE2] text-[#3B3B33] border-[#3B3B33]/15",
  };

  return (
    <div
      className={`bg-white border border-[#3B3B33]/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#3B3B33]/20 transition-all group ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-[#3B3B33]/70 mb-3">
        <span className="font-sans font-semibold uppercase tracking-wider flex items-center gap-2">
          {icon && (
            <span className="w-6 h-6 rounded-lg bg-[#09342B]/5 text-[#09342B] flex items-center justify-center transition-colors group-hover:bg-[#E5F937] group-hover:text-[#09342B]">
              {icon}
            </span>
          )}
          <span>{title}</span>
        </span>
        {badge && (
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-medium ${badgeClasses[badgeColor]}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-3xl font-bold text-[#09342B] tracking-tight font-sans">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-[#3B3B33]/60">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] font-sans text-[#3B3B33]/60 mt-2 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
