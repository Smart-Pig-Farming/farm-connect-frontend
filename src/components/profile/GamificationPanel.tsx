import React from "react";
import LevelBadge from "@/components/profile/LevelBadge";
import { PRESTIGE_META, PRESTIGE_ORDER, LEVELS } from "@/lib/scoringLevels";
import type { PrestigeKey } from "@/lib/scoringLevels";
import { useValueFlash } from "@/hooks/useValueFlash";

interface Props {
  points: number;
  levelLabel: string;
  level: number;
  nextLevelAt: number | null;
  levelProgressPercent: number; // 0-100
  prestige?: string | null;
  className?: string;
}

function format(n: number) {
  return n.toLocaleString();
}

export const GamificationPanel: React.FC<Props> = ({
  points,
  levelLabel,
  level,
  nextLevelAt,
  levelProgressPercent,
  prestige,
  className = "",
}) => {
  const prestigeMeta = prestige ? PRESTIGE_META[prestige as PrestigeKey] : null;
  const prestigeIndex = prestige
    ? PRESTIGE_ORDER.indexOf(prestige as PrestigeKey)
    : -1;

  // Find the next level name
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  const nextLevelName = nextLevel ? nextLevel.label : null;

  // Flash states
  const pointsFlash = useValueFlash(points);
  const progressFlash = useValueFlash(levelProgressPercent);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge
              levelLabel={levelLabel}
              prestigeLabel={prestige || null}
              points={points}
              className={
                pointsFlash
                  ? pointsFlash === "up"
                    ? "ring-2 ring-green-400/70 shadow-md"
                    : "ring-2 ring-rose-400/70 shadow-md"
                  : ""
              }
            />
            {prestigeMeta && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/25 text-white/90 font-medium">
                {prestigeMeta.label}
              </span>
            )}
            <span
              className={`text-[11px] font-medium transition-colors duration-300 ${
                pointsFlash === "up"
                  ? "text-green-300 drop-shadow-[0_0_4px_rgba(74,222,128,0.8)]"
                  : pointsFlash === "down"
                  ? "text-rose-300 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                  : "text-white/80"
              }`}
            >
              {format(points)} pts
            </span>
          </div>
          <div className="mt-3">
            {nextLevelAt ? (
              <div
                className="space-y-1"
                aria-label="Level progress"
                title={`${nextLevelAt - points} points to next level`}
              >
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 transition-all duration-700 ease-out ${
                      progressFlash === "up"
                        ? "shadow-[0_0_6px_2px_rgba(16,185,129,0.6)]"
                        : progressFlash === "down"
                        ? "opacity-80"
                        : ""
                    }`}
                    style={{ width: `${Math.max(levelProgressPercent, 6)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-white/80">
                  <span className="font-medium">Lvl {level}</span>
                  <span className="font-medium">
                    {nextLevelName || `Lvl ${level + 1}`}
                  </span>
                </div>
                <div className="text-center text-[9px] text-white/60 mt-1">
                  {format(nextLevelAt - points)} pts to next level
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-yellow-100 font-medium">
                Max level reached
              </div>
            )}
          </div>
        </div>
      </div>
      {prestigeIndex >= 0 && (
        <div className="text-[10px] text-white/70">
          Prestige Rank {prestigeIndex + 1} / {PRESTIGE_ORDER.length}
        </div>
      )}
    </div>
  );
};

export default GamificationPanel;
