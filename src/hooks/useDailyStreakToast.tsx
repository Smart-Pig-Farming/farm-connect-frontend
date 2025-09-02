import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGetMyScoreQuery } from "@/store/api/scoreApi";
import type { MyScore } from "@/store/api/scoreApi";

// Local storage key to ensure we only show toast once per day per user
function key(userId: number | string) {
  return `streak-toast-${userId}`;
}

// Mapping of milestone lengths to bonus points (aligns with scoring_system.md)
const BONUS_MAP: Record<number, number> = {
  7: 5,
  30: 10,
  90: 15,
  180: 20,
  365: 25,
};

export function useDailyStreakToast(userId?: number) {
  const { data, refetch } = useGetMyScoreQuery(undefined, { skip: !userId });
  const shownRef = useRef(false);

  useEffect(() => {
    if (!userId || shownRef.current) return;
    if (!data?.streak) return;
    const streak = data.streak as MyScore["streak"];
    const { current, lastDay } = streak;
    if (!current || !lastDay) return;

    const todayStr = new Date().toISOString().substring(0, 10);
    if (lastDay !== todayStr) {
      // The async streak update may not have finished; schedule one delayed refetch attempt.
      const t = setTimeout(() => {
        if (!shownRef.current) refetch();
      }, 2000);
      return () => clearTimeout(t);
    }

    try {
      const ls = localStorage.getItem(key(userId));
      if (ls === todayStr) return; // already shown today
    } catch {
      // ignore
    }

    shownRef.current = true;
    try {
      localStorage.setItem(key(userId), todayStr);
    } catch {
      // ignore
    }

    const bonus = BONUS_MAP[current] || 0;
    toast.success(
      () => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Daily Login Streak</div>
          <div className="text-sm">
            You're on a {current}-day streak
            {bonus ? ` and earned +${bonus} pts!` : "!"}
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  }, [data, userId, refetch]);
}

export default useDailyStreakToast;
