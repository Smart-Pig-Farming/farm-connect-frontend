import React from "react";

interface LevelBadgeProps {
  levelLabel: string;
  prestigeLabel?: string | null;
  points?: number;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  levelLabel,
  prestigeLabel,
  points,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs shadow transition-all duration-300 ${className}`}
    >
      <span className="font-semibold whitespace-nowrap">{levelLabel}</span>
      {prestigeLabel && (
        <span className="bg-white/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
          {prestigeLabel}
        </span>
      )}
      {typeof points === "number" && (
        <span className="bg-white/15 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
          {points.toLocaleString()} pts
        </span>
      )}
    </div>
  );
};

export default LevelBadge;
