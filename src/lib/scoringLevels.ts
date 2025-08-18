export interface LevelDef {
  level: number;
  label: string;
  min: number;
  max: number | null;
}

export const LEVELS: LevelDef[] = [
  { level: 1, label: "Newcomer", min: 0, max: 20 },
  { level: 2, label: "Amateur", min: 21, max: 149 },
  { level: 3, label: "Contributor", min: 150, max: 299 },
  { level: 4, label: "Knight", min: 300, max: 599 },
  { level: 5, label: "Expert", min: 600, max: null },
];

export type PrestigeKey = "EXPERT_I" | "EXPERT_II" | "EXPERT_III" | "MODERATOR";

export const PRESTIGE_ORDER: PrestigeKey[] = [
  "EXPERT_I",
  "EXPERT_II",
  "EXPERT_III",
  "MODERATOR",
];

export const PRESTIGE_META: Record<
  PrestigeKey,
  { label: string; points: number; approvals?: number }
> = {
  EXPERT_I: { label: "Expert I", points: 1600, approvals: 10 },
  EXPERT_II: { label: "Expert II", points: 4100, approvals: 50 },
  EXPERT_III: { label: "Expert III", points: 14100 },
  MODERATOR: { label: "Moderator", points: 14100 },
};

export function findLevel(totalPoints: number) {
  return (
    LEVELS.find(
      (l) => totalPoints >= l.min && (l.max == null || totalPoints <= l.max)
    ) || LEVELS[0]
  );
}

export function levelProgress(totalPoints: number) {
  const lvl = findLevel(totalPoints);
  if (lvl.max == null)
    return {
      percent: 100,
      current: totalPoints,
      floor: lvl.min,
      ceil: totalPoints,
    };
  const span = lvl.max - lvl.min;
  const pct =
    span <= 0 ? 100 : Math.min(100, ((totalPoints - lvl.min) / span) * 100);
  return { percent: pct, current: totalPoints, floor: lvl.min, ceil: lvl.max };
}
