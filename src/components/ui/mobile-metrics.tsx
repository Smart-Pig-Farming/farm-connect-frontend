import React from "react";

interface MobileMetricsProps {
  totalPoints: number;
  levelLabel: string;
  currentStreak: number;
  bestStreak: number;
  next: number | null;
  daysToGo: number;
  bonus: number;
  streakIcon: (streak: number) => string;
  bonusFor: (streak: number) => number;
}

export const MobileMetrics: React.FC<MobileMetricsProps> = ({
  totalPoints,
  levelLabel,
  currentStreak,
  bestStreak,
  next,
  daysToGo,
  bonus,
  streakIcon,
  bonusFor,
}) => {
  return (
    <div className="sm:hidden space-y-4 mb-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-black text-gray-900 mb-1">Your Progress</h2>
        <p className="text-sm text-gray-600">Track your farming journey</p>
      </div>

      {/* Points Display - Mobile Horizontal */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-orange-600 tabular-nums">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 font-semibold uppercase">
              Total Points
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{levelLabel}</div>
            <div className="text-xs text-gray-600 font-medium uppercase">
              Level
            </div>
          </div>
        </div>
      </div>

      {/* Streak & Goal - Mobile Side by Side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-amber-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg">{streakIcon(currentStreak)}</div>
              <div className="text-sm font-black text-gray-800">
                {currentStreak}
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-900 mb-1">
            Daily Streak
          </div>
          <div className="text-xs text-gray-600">
            {currentStreak === 0 ? "Start today!" : `${currentStreak} days!`}
          </div>
          {bestStreak > currentStreak && (
            <div className="mt-2 inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              <span>👑</span>
              <span>{bestStreak}</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-green-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <div className="text-lg text-emerald-600">🎯</div>
          </div>
          <div className="text-xs font-semibold text-gray-900 mb-1">
            Next Goal
          </div>
          {next ? (
            <div>
              <div className="text-xs text-gray-800 font-medium">
                {daysToGo} days to {next}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                <span>🎁</span>
                <span>+{bonus}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-600 font-medium">
              Max reached! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Mobile Milestone Progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            🏆 Streak Milestones
          </h3>
          <p className="text-xs text-gray-600">Your path to farming mastery</p>
        </div>

        {/* Mobile Progress Bar */}
        <div className="relative mb-3">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min((currentStreak / 365) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Mobile Milestone Dots - Compact */}
        <div className="flex justify-between items-center">
          {[7, 30, 90, 180, 365].map((milestone, i) => {
            const isCompleted = currentStreak >= milestone;
            const isCurrent = next === milestone;
            const bonusPoints = bonusFor(milestone);

            return (
              <div key={milestone} className="text-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    isCompleted
                      ? "bg-orange-500 text-white"
                      : isCurrent
                      ? "bg-white border-2 border-orange-400 text-orange-600 animate-pulse"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted
                    ? "✓"
                    : i === 0
                    ? "🔥"
                    : i === 1
                    ? "💥"
                    : i === 2
                    ? "⚡"
                    : i === 3
                    ? "🌟"
                    : "🏆"}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {milestone}d
                </div>
                <div className="text-xs text-gray-500">+{bonusPoints}</div>
              </div>
            );
          })}
        </div>

        {/* Motivational Message */}
        <div className="text-center mt-3">
          <p className="text-xs font-medium text-gray-700">
            {currentStreak === 0
              ? "🌱 Start your streak today!"
              : next
              ? `💪 ${daysToGo} more day${daysToGo === 1 ? "" : "s"} to go!`
              : "🎉 All milestones conquered!"}
          </p>
        </div>
      </div>
    </div>
  );
};
