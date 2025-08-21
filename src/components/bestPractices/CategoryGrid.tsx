import { type FC } from "react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type { BestPracticeCategory } from "@/types/bestPractices";
import { getCategoryIcon } from "./iconMap";

interface CategoryGridProps {
  mode: "learn" | "quiz";
  onSelect: (cat: BestPracticeCategory) => void;
}

export const CategoryGrid: FC<CategoryGridProps> = ({ mode, onSelect }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {BEST_PRACTICE_CATEGORIES.map((c) => {
        const Icon = getCategoryIcon(c.key as "feeding_nutrition");
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c)}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-orange-300 dark:hover:ring-orange-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-left hover:cursor-pointer"
          >
            {/* Icon with gradient background */}
            <div className="relative mb-4">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                  mode === "learn"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-red-500"
                    : "bg-gradient-to-br from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-red-500"
                } shadow-lg`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                {c.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {mode === "learn"
                  ? "Explore best practices and guidance"
                  : "Test your knowledge with quizzes"}
              </p>

              {/* Stats and arrow */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-all duration-300">
                  {mode === "learn" ? "0 practices" : "0 questions"}
                </span>
                <div className="flex items-center text-slate-400 group-hover:text-orange-500 transition-colors duration-300">
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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-orange-500/4 to-red-500/8 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
};
