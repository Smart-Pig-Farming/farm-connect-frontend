import { type FC, useMemo } from "react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type { BestPracticeCategory } from "@/types/bestPractices";
import { getCategoryIcon } from "./iconMap";
import { useGetQuizTagStatsQuery } from "@/store/api/quizApi";

// mapping backend tag display names to category keys
const QUIZ_TAG_NAME_MAP: Record<string, string> = {
  feeding_nutrition: "Feeding & Nutrition",
  disease_control: "Disease Control",
  growth_weight_mgmt: "Growth & Weight Mgmt",
  environment_mgmt: "Environment Mgmt",
  breeding_insemination: "Breeding & Insemination",
  farrowing_mgmt: "Farrowing Mgmt",
  record_farm_mgmt: "Record & Farm Mgmt",
  marketing_finance: "Marketing & Finance",
};

// Map tailwind color stems to gradient classes (from -> to)
const COLOR_GRADIENTS: Record<
  string,
  { icon: string; hoverIcon: string; hoverBg: string; textHover: string }
> = {
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600",
    hoverIcon: "group-hover:from-amber-600 group-hover:to-amber-700",
    hoverBg: "from-amber-500/8 via-amber-500/4 to-amber-600/8",
    textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
  },
  red: {
    icon: "bg-gradient-to-br from-red-500 to-red-600",
    hoverIcon: "group-hover:from-red-600 group-hover:to-rose-600",
    hoverBg: "from-red-500/8 via-red-500/4 to-rose-500/8",
    textHover: "group-hover:text-red-600 dark:group-hover:text-red-400",
  },
  teal: {
    icon: "bg-gradient-to-br from-teal-500 to-teal-600",
    hoverIcon: "group-hover:from-teal-600 group-hover:to-cyan-600",
    hoverBg: "from-teal-500/8 via-teal-500/4 to-cyan-500/8",
    textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
  },
  green: {
    icon: "bg-gradient-to-br from-green-500 to-emerald-600",
    hoverIcon: "group-hover:from-green-600 group-hover:to-emerald-700",
    hoverBg: "from-green-500/8 via-green-500/4 to-emerald-500/8",
    textHover: "group-hover:text-green-600 dark:group-hover:text-emerald-400",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    hoverIcon: "group-hover:from-indigo-600 group-hover:to-violet-600",
    hoverBg: "from-indigo-500/8 via-indigo-500/4 to-violet-500/8",
    textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  },
  pink: {
    icon: "bg-gradient-to-br from-pink-500 to-rose-500",
    hoverIcon: "group-hover:from-pink-600 group-hover:to-rose-600",
    hoverBg: "from-pink-500/8 via-pink-500/4 to-rose-500/8",
    textHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
  },
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-600",
    hoverIcon: "group-hover:from-blue-600 group-hover:to-indigo-600",
    hoverBg: "from-blue-500/8 via-blue-500/4 to-indigo-500/8",
    textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  purple: {
    icon: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    hoverIcon: "group-hover:from-purple-600 group-hover:to-fuchsia-600",
    hoverBg: "from-purple-500/8 via-purple-500/4 to-fuchsia-500/8",
    textHover: "group-hover:text-purple-600 dark:group-hover:text-fuchsia-400",
  },
  default: {
    icon: "bg-gradient-to-br from-orange-500 to-orange-600",
    hoverIcon: "group-hover:from-orange-600 group-hover:to-red-500",
    hoverBg: "from-orange-500/8 via-orange-500/4 to-red-500/8",
    textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
  },
};

function getGradient(color?: string) {
  return COLOR_GRADIENTS[color || ""] || COLOR_GRADIENTS.default;
}

interface CategoryGridProps {
  mode: "learn" | "quiz";
  onSelect: (cat: BestPracticeCategory) => void;
  practiceCounts?: Record<string, number>; // existing content counts
  quizCounts?: Record<string, number>; // optional override for quiz question counts
}

export const CategoryGrid: FC<CategoryGridProps> = ({
  mode,
  onSelect,
  practiceCounts = {},
  quizCounts,
}) => {
  // fetch live quiz tag stats (question counts) unless override provided
  const {
    data: tagStatsData,
    isLoading: loadingTagStats,
    isError: tagStatsError,
    error: tagStatsErrorObj,
  } = useGetQuizTagStatsQuery(undefined, { skip: !!quizCounts });
  const derivedQuizCounts = useMemo(() => {
    if (quizCounts) return quizCounts;
    const map: Record<string, number> = {};
    if (tagStatsData?.tags) {
      for (const cKey of Object.keys(QUIZ_TAG_NAME_MAP)) {
        const tagName = QUIZ_TAG_NAME_MAP[cKey];
        const found = tagStatsData.tags.find((t) => t.tag_name === tagName);
        if (found) map[cKey] = found.question_count;
      }
    }
    return map;
  }, [quizCounts, tagStatsData]);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {BEST_PRACTICE_CATEGORIES.map((c) => {
        const Icon = getCategoryIcon(c.key as "feeding_nutrition");
        const grad = getGradient(c.color);
        const count = practiceCounts[c.key] || 0;
        const qCount = derivedQuizCounts[c.key] || 0;
        const showQuizCounts = mode === "quiz";
        const quizCountContent = (() => {
          if (!showQuizCounts)
            return `${count} practice${count !== 1 ? "s" : ""}`;
          if (quizCounts) return `${qCount} question${qCount !== 1 ? "s" : ""}`; // override provided
          if (loadingTagStats)
            return (
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
                <span>Loading…</span>
              </span>
            );
          if (tagStatsError) {
            // best-effort extraction without any casts
            let msg: string | undefined;
            if (
              typeof tagStatsErrorObj === "object" &&
              tagStatsErrorObj !== null
            ) {
              const errObj = tagStatsErrorObj as Record<string, unknown>;
              if (typeof errObj.error === "string") {
                msg = errObj.error;
              } else if (errObj.data && typeof errObj.data === "object") {
                const dataObj = errObj.data as Record<string, unknown>;
                if (typeof dataObj.error === "string") msg = dataObj.error;
              }
            }
            return <span title={msg || "Failed to load quiz stats"}>—</span>;
          }
          return `${qCount} question${qCount !== 1 ? "s" : ""}`;
        })();
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c)}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 text-left hover:cursor-pointer"
          >
            {/* Icon with gradient background */}
            <div className="relative mb-4">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${grad.icon} ${grad.hoverIcon} shadow-lg`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3
                className={`font-semibold text-slate-900 dark:text-white text-lg line-clamp-2 transition-colors duration-300 ${grad.textHover}`}
              >
                {c.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {mode === "learn"
                  ? "Explore best practices and guidance"
                  : "Test your knowledge with quizzes"}
              </p>

              {/* Stats and arrow */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full transition-all duration-300 group-hover:ring-1 group-hover:ring-inset group-hover:ring-current min-w-[72px] text-center">
                  {quizCountContent}
                </span>
                <div
                  className={`flex items-center text-slate-400 transition-colors duration-300 ${grad.textHover}`}
                >
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced hover background effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${grad.hoverBg} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
            />
          </button>
        );
      })}
    </div>
  );
};
