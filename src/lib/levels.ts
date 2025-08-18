import {
  Leaf,
  Star,
  Sparkles,
  Shield,
  Crown,
  Award,
  Medal,
  Trophy,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Core level metadata aligned with backend LevelService thresholds
export interface LevelMeta {
  id: number;
  name: string;
  min: number;
  max: number | null; // null means Infinity
  icon: LucideIcon;
  badgeClasses: string; // Tailwind utility classes for badge container
  iconClasses: string; // Tailwind classes applied to icon
  textClasses: string; // Text color classes (used in leaderboard simple pill)
}

export const CORE_LEVELS: LevelMeta[] = [
  {
    id: 1,
    name: "Newcomer",
    min: 0,
    max: 20,
    icon: Leaf,
    badgeClasses:
      "bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 text-slate-700",
    iconClasses: "text-emerald-500",
    textClasses: "text-slate-600",
  },
  {
    id: 2,
    name: "Amateur",
    min: 21,
    max: 149,
    icon: Star,
    badgeClasses:
      "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700",
    iconClasses: "text-amber-500",
    textClasses: "text-amber-600",
  },
  {
    id: 3,
    name: "Contributor",
    min: 150,
    max: 299,
    icon: Sparkles,
    badgeClasses:
      "bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 text-violet-700",
    iconClasses: "text-violet-500",
    textClasses: "text-violet-600",
  },
  {
    id: 4,
    name: "Knight",
    min: 300,
    max: 599,
    icon: Shield,
    badgeClasses:
      "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700",
    iconClasses: "text-indigo-500",
    textClasses: "text-indigo-600",
  },
  {
    id: 5,
    name: "Expert",
    min: 600,
    max: null, // open ended
    icon: Crown,
    badgeClasses:
      "bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-800",
    iconClasses: "text-yellow-500",
    textClasses: "text-yellow-600",
  },
];

// Prestige tiers (post-Level 5) — visual layer on top of Expert
export interface PrestigeMeta {
  tier: string;
  icon: LucideIcon;
  badgeClasses: string;
  iconClasses: string;
}

export const PRESTIGE_LEVELS: PrestigeMeta[] = [
  {
    tier: "Expert I",
    icon: Award,
    badgeClasses:
      "bg-gradient-to-r from-amber-200 to-amber-300 border border-amber-400 text-amber-900",
    iconClasses: "text-amber-600",
  },
  {
    tier: "Expert II",
    icon: Medal,
    badgeClasses:
      "bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 text-gray-900",
    iconClasses: "text-gray-600",
  },
  {
    tier: "Expert III",
    icon: Trophy,
    badgeClasses:
      "bg-gradient-to-r from-yellow-300 to-yellow-400 border border-yellow-500 text-yellow-900",
    iconClasses: "text-yellow-600",
  },
  {
    tier: "Moderator",
    icon: ShieldCheck,
    badgeClasses:
      "bg-gradient-to-r from-emerald-400 to-teal-600 border border-emerald-600 text-white",
    iconClasses: "text-white",
  },
];

// --- Helper Functions ---

export function getLevelMeta(levelId?: number | null): LevelMeta {
  if (!levelId || levelId < 1) return CORE_LEVELS[0];
  return CORE_LEVELS.find((l) => l.id === levelId) || CORE_LEVELS[CORE_LEVELS.length - 1];
}

export function getLevelName(levelId?: number | null): string {
  return getLevelMeta(levelId).name;
}

export function getLevelColor(levelId?: number | null): string {
  return getLevelMeta(levelId).textClasses;
}

export function getLevelBadgeStyle(levelId?: number | null): string {
  return getLevelMeta(levelId).badgeClasses;
}

export function getLevelIcon(levelId?: number | null): LucideIcon {
  return getLevelMeta(levelId).icon;
}

export function getPrestigeMeta(tier?: string | null): PrestigeMeta | undefined {
  if (!tier) return undefined;
  return PRESTIGE_LEVELS.find((p) => p.tier === tier);
}

// Convenience: returns badge config for either prestige (if provided) else core level
export function getCompositeBadge(levelId?: number | null, prestige?: string | null) {
  const prestigeMeta = getPrestigeMeta(prestige || undefined);
  if (prestigeMeta) {
    return {
      label: prestigeMeta.tier,
      badgeClasses: prestigeMeta.badgeClasses,
      icon: prestigeMeta.icon,
      iconClasses: prestigeMeta.iconClasses,
      isPrestige: true,
    };
  }
  const level = getLevelMeta(levelId);
  return {
    label: level.name,
    badgeClasses: level.badgeClasses,
    icon: level.icon,
    iconClasses: level.iconClasses,
    isPrestige: false,
  };
}

export default {
  CORE_LEVELS,
  PRESTIGE_LEVELS,
  getLevelName,
  getLevelColor,
  getLevelBadgeStyle,
  getLevelIcon,
  getCompositeBadge,
};
