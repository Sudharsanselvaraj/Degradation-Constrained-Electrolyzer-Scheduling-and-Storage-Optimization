import React from "react";

export type HydraulixLogoVariant = "adaptive" | "dark" | "white" | "lime";
export type HydraulixLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface HydraulixLogoProps {
  variant?: HydraulixLogoVariant;
  size?: HydraulixLogoSize;
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  markOnly?: boolean;
  animated?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}

// Mathematically reconstructed petal path matching the 6-fold radial rosette geometry
const PETAL_PATH =
  "M 20.35,7.23 Q 19.38,9.54 21.62,10.64 L 38.76,19.07 Q 41.99,20.66 43.46,17.37 A 46.80 46.80 0 0 0 43.46,-17.37 Q 41.99,-20.66 38.76,-19.07 L 21.62,-10.64 Q 19.38,-9.54 20.35,-7.23 A 21.60 21.60 0 0 1 20.35,7.23 Z";

const ROTATIONS = [30, 90, 150, 210, 270, 330];

export const HydraulixMark: React.FC<{
  sizePx?: number;
  color?: string;
  className?: string;
  animated?: boolean;
}> = ({ sizePx = 32, color = "currentColor", className = "", animated = false }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={sizePx}
      height={sizePx}
      fill={color}
      className={`shrink-0 transition-transform duration-300 ${
        animated ? "group-hover:rotate-6 group-hover:scale-105" : ""
      } ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(50, 50)">
        {/* Solid center circle */}
        <circle cx={0} cy={0} r={14.0} />
        {/* 6 radial rounded petals */}
        {ROTATIONS.map((deg) => (
          <path key={deg} d={PETAL_PATH} transform={`rotate(${deg})`} />
        ))}
      </g>
    </svg>
  );
};

export const HydraulixLogo: React.FC<HydraulixLogoProps> = ({
  variant = "adaptive",
  size = "md",
  showText = true,
  showSubtitle = true,
  subtitleText = "GREEN HYDROGEN TWIN",
  markOnly = false,
  animated = false,
  className = "",
  markClassName = "",
  textClassName = "",
  onClick,
}) => {
  // Sizing definitions
  const sizeMap: Record<
    HydraulixLogoSize,
    { markPx: number; titleClass: string; subClass: string; gapClass: string }
  > = {
    xs: {
      markPx: 20,
      titleClass: "text-sm font-bold tracking-tight",
      subClass: "text-[8px] tracking-widest",
      gapClass: "space-x-2",
    },
    sm: {
      markPx: 26,
      titleClass: "text-base font-bold tracking-tight",
      subClass: "text-[9px] tracking-widest",
      gapClass: "space-x-2.5",
    },
    md: {
      markPx: 34,
      titleClass: "text-lg font-bold tracking-tight",
      subClass: "text-[10px] tracking-wider",
      gapClass: "space-x-3",
    },
    lg: {
      markPx: 42,
      titleClass: "text-2xl font-bold tracking-tight",
      subClass: "text-[11px] tracking-widest",
      gapClass: "space-x-3.5",
    },
    xl: {
      markPx: 54,
      titleClass: "text-3xl font-extrabold tracking-tight",
      subClass: "text-xs tracking-widest",
      gapClass: "space-x-4",
    },
  };

  const { markPx, titleClass, subClass, gapClass } = sizeMap[size];

  // Colors based on variant
  let markColor = "currentColor";
  let titleColorClass = "text-current";
  let subtitleColorClass = "text-current/60";

  if (variant === "dark") {
    markColor = "#09342B";
    titleColorClass = "text-[#09342B]";
    subtitleColorClass = "text-[#09342B]/60";
  } else if (variant === "white") {
    markColor = "#FFFFFF";
    titleColorClass = "text-white";
    subtitleColorClass = "text-white/70";
  } else if (variant === "lime") {
    markColor = "#E5F937";
    titleColorClass = "text-white";
    subtitleColorClass = "text-[#E5F937]";
  }

  if (markOnly || !showText) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <HydraulixMark
          sizePx={markPx}
          color={markColor}
          className={markClassName}
          animated={animated}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${gapClass} select-none group ${className}`}
      onClick={onClick}
    >
      <HydraulixMark
        sizePx={markPx}
        color={markColor}
        className={markClassName}
        animated={animated}
      />
      <div className={`flex flex-col leading-none ${textClassName}`}>
        <span
          className={`font-sans ${titleClass} ${titleColorClass} transition-colors`}
        >
          HYDRAULIX
        </span>
        {showSubtitle && (
          <span
            className={`font-mono uppercase font-semibold mt-0.5 ${subClass} ${subtitleColorClass} transition-colors`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export default HydraulixLogo;
