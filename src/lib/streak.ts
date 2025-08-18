// Streak reward milestones (aligns with scoring_system.md bonuses)
// Used for circular progress indicator: progress toward next reward tier
export const STREAK_THRESHOLDS = [7, 30, 90, 180, 365];

export function nextStreakTarget(current: number): number {
  for (const t of STREAK_THRESHOLDS) {
    if (current < t) return t;
  }
  // After final listed milestone, continue in yearly (365d) increments
  const last = STREAK_THRESHOLDS[STREAK_THRESHOLDS.length - 1];
  const step = 365;
  const over = current - last;
  const nextMultiple = Math.floor(over / step) + 1; // 1 => 730, etc.
  return last + nextMultiple * step;
}

export function streakProgress(current: number) {
  const target = nextStreakTarget(current);
  const percent = Math.min(100, (current / target) * 100);
  // Determine reward based on milestone table (mirrors scoring_system)
  // Map milestone -> reward
  const rewardTable: Record<number, number> = {
    7: 5,
    30: 10,
    90: 15,
    180: 20,
    365: 25,
  };
  const reward = rewardTable[target] ?? 0;
  return { target, percent, reward };
}
