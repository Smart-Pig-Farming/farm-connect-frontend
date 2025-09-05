import React, { useId, useMemo } from "react";
import { Flame } from "lucide-react";
import { streakProgress } from "@/lib/streak";

interface StreakCircleProps {
  current: number;
  best: number;
  size?: number; // px diameter
  strokeWidth?: number;
}

const StreakCircle: React.FC<StreakCircleProps> = ({
  current,
  best,
  size = 60,
  strokeWidth = 8,
}) => {
  const { target, percent, reward } = streakProgress(current);
  const gradientId = useId();

  // Provide distinct (non-orange) progress colors per milestone target for visual freshness.
  const gradientStops = useMemo(() => {
    // Using cool / fresh palette to contrast orange header.
    if (target === 7) return ["#34d399", "#10b981", "#059669"]; // emerald
    if (target === 30) return ["#22d3ee", "#0ea5e9", "#0284c7"]; // cyan -> blue
    if (target === 90) return ["#a78bfa", "#8b5cf6", "#6d28d9"]; // violet
    if (target === 180) return ["#f472b6", "#ec4899", "#db2777"]; // pink
    return ["#fde047", "#facc15", "#ca8a04"]; // gold for long streaks (365+)
  }, [target]);

  const { radius, circumference, dash } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    return { radius: r, circumference: c, dash: (percent / 100) * c };
  }, [size, strokeWidth, percent]);

  const aria = `Streak ${current} days. Goal ${target} days${
    reward ? ` for +${reward} points` : ""
  }. Best ${best} days.`;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      aria-label={aria}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle base glow (neutral, not indicating progress) */}
        <div className="absolute inset-0 rounded-full bg-white/5 blur-[2px]" />
        <svg
          width={size}
          height={size}
          className="relative rotate-[-90deg] block"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            className="transition-[stroke-dasharray] duration-700 ease-out drop-shadow-sm"
            stroke={`url(#grad-${gradientId})`}
          />
          <defs>
            <linearGradient
              id={`grad-${gradientId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradientStops[0]} />
              <stop offset="55%" stopColor={gradientStops[1]} />
              <stop offset="100%" stopColor={gradientStops[2]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame className="h-6 w-6 text-white/85 drop-shadow" aria-hidden />
        </div>
      </div>
      <div className="mt-1 flex flex-col items-center text-[10px] font-medium tracking-wide leading-tight">
        <span className="text-white/80">
          Day {current < target ? current : target} of {target}
        </span>
        {reward > 0 && current < target && (
          <span className="mt-0.5 px-2 py-[2px] rounded-full bg-emerald-500/70 text-white font-semibold shadow-sm border border-emerald-400/60">
            +{reward}
          </span>
        )}
      </div>
    </div>
  );
};

export default StreakCircle;
