import { Award, RefreshCw } from "lucide-react";
import { useGetMyScoreQuery } from "@/store/api/scoreApi";
import { Card } from "@/components/ui/card";
import React from "react";
import { LEVELS, PRESTIGE_META, PRESTIGE_ORDER } from "@/lib/scoringLevels";
import type { PrestigeKey } from "@/lib/scoringLevels";
import LevelBadge from "@/components/profile/LevelBadge";
import StreakCircle from "@/components/score/StreakCircle";
import { useValueFlash } from "@/hooks/useValueFlash";

// Using shared LEVELS & prestige metadata

function formatNumber(n: number) {
  return n.toLocaleString();
}

export const MyScoreWidget: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetMyScoreQuery();

  // Prepare values for hooks even if loading/error (use safe fallbacks)
  const safeTotalPoints = data?.totalPoints ?? 0;
  const safeModApprovals = data?.modApprovals ?? 0;
  const pointsFlash = useValueFlash(safeTotalPoints);
  const approvalsFlash = useValueFlash(safeModApprovals);

  if (isLoading) {
    return (
      <Card className="p-4 shadow-sm bg-white/70 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-full bg-gray-200 rounded" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <div className="text-sm text-red-700 font-medium mb-2">
          Failed to load score
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </Card>
    );
  }

  const {
    totalPoints,
    level,
    levelLabel,
    nextLevelAt,
    prestige,
    modApprovals,
    streak,
  } = data;

  const levelInfo = LEVELS.find((l) => l.level === level) || LEVELS[0];

  const levelFloor = levelInfo.min;
  const rawCeil = levelInfo.max === Infinity ? totalPoints : levelInfo.max;
  const levelCeil = rawCeil == null ? totalPoints : rawCeil;
  const levelSpan = Math.max(1, levelCeil - levelFloor);
  const levelProgress =
    levelInfo.max === Infinity
      ? 100
      : Math.min(100, ((totalPoints - levelFloor) / levelSpan) * 100);

  const prestigeLabel = prestige
    ? PRESTIGE_META[prestige as PrestigeKey]?.label || prestige
    : null;
  const currentPrestigeIndex = prestige
    ? PRESTIGE_ORDER.indexOf(prestige as PrestigeKey)
    : -1;
  const nextPrestigeKey =
    currentPrestigeIndex >= 0 &&
    currentPrestigeIndex < PRESTIGE_ORDER.length - 1
      ? PRESTIGE_ORDER[currentPrestigeIndex + 1]
      : !prestige && level >= 5
      ? PRESTIGE_ORDER[0]
      : null;
  const nextPrestige = nextPrestigeKey ? PRESTIGE_META[nextPrestigeKey] : null;

  let prestigeProgressPct: number | null = null;
  let approvalsProgressPct: number | null = null;
  if (nextPrestige) {
    prestigeProgressPct = Math.min(
      100,
      (totalPoints / nextPrestige.points) * 100
    );
    if (nextPrestige.approvals) {
      approvalsProgressPct = Math.min(
        100,
        (modApprovals / nextPrestige.approvals) * 100
      );
    }
  }

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-500" />
          My Score
        </h3>
        <div className="flex items-center gap-4 ml-auto">
          <StreakCircle current={streak.current} best={streak.best} />
          <button
            aria-label="Refresh score"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-1.5 rounded-md border border-gray-200 bg-white/60 hover:bg-white transition ${
              isFetching ? "animate-spin" : ""
            }`}
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <div
            className={`text-3xl font-extrabold leading-tight transition-[color,filter] duration-300 ${
              pointsFlash === "up"
                ? "text-green-600 drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]"
                : pointsFlash === "down"
                ? "text-rose-600 drop-shadow-[0_0_4px_rgba(244,63,94,0.55)]"
                : "text-gray-900"
            }`}
          >
            {formatNumber(totalPoints)}
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Total Points
          </div>
        </div>
        <LevelBadge
          levelLabel={levelLabel}
          prestigeLabel={prestigeLabel}
          className={
            pointsFlash
              ? pointsFlash === "up"
                ? "animate-pulse ring-2 ring-green-400/70"
                : "animate-pulse ring-2 ring-rose-400/70"
              : ""
          }
        />
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>Level Progress</span>
          <span>{Math.round(levelProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-200/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        {!nextLevelAt && (
          <div className="text-[11px] text-yellow-600 mt-1">
            Max base level reached
          </div>
        )}
      </div>
      {nextPrestige && (
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span>Progress to {nextPrestige.label}</span>
            {prestigeProgressPct !== null && (
              <span>{Math.round(prestigeProgressPct)}%</span>
            )}
          </div>
          <div className="h-2 bg-gray-200/70 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500 ${
                approvalsFlash === "up"
                  ? "shadow-[0_0_6px_2px_rgba(251,146,60,0.6)]"
                  : approvalsFlash === "down"
                  ? "opacity-80"
                  : ""
              }`}
              style={{ width: `${prestigeProgressPct || 0}%` }}
            />
          </div>
          {nextPrestige.approvals && (
            <div className="h-2 bg-gray-200/60 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500 ${
                  approvalsFlash === "up"
                    ? "shadow-[0_0_6px_2px_rgba(129,140,248,0.6)]"
                    : ""
                }`}
                style={{ width: `${approvalsProgressPct || 0}%` }}
              />
            </div>
          )}
          <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              {formatNumber(totalPoints)} / {formatNumber(nextPrestige.points)}{" "}
              pts
            </span>
            {nextPrestige.approvals && (
              <span
                className={
                  approvalsFlash
                    ? approvalsFlash === "up"
                      ? "text-indigo-600 font-semibold"
                      : ""
                    : ""
                }
              >
                {modApprovals} / {nextPrestige.approvals} approvals
              </span>
            )}
          </div>
        </div>
      )}
      {/* Streak stats replaced by circular indicator above */}
    </Card>
  );
};

export default MyScoreWidget;
