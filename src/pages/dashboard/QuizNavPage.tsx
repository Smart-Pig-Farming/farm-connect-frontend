import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Database } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import { getCategoryIcon } from "@/components/bestPractices/iconMap";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";
import { usePermissions } from "@/hooks/usePermissions";

// Color gradients matching CategoryGrid exactly
const COLOR_GRADIENTS: Record<
  string,
  {
    icon: string;
    hoverIcon: string;
    hoverBg: string;
    textHover: string;
    hoverBorder: string;
    dotColor: string;
  }
> = {
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600",
    hoverIcon: "group-hover:from-amber-600 group-hover:to-amber-700",
    hoverBg: "from-amber-500/8 via-amber-500/4 to-amber-600/8",
    textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    hoverBorder: "hover:border-amber-200/80",
    dotColor: "bg-amber-500",
  },
  red: {
    icon: "bg-gradient-to-br from-red-500 to-red-600",
    hoverIcon: "group-hover:from-red-600 group-hover:to-rose-600",
    hoverBg: "from-red-500/8 via-red-500/4 to-rose-500/8",
    textHover: "group-hover:text-red-600 dark:group-hover:text-red-400",
    hoverBorder: "hover:border-red-200/80",
    dotColor: "bg-red-500",
  },
  teal: {
    icon: "bg-gradient-to-br from-teal-500 to-teal-600",
    hoverIcon: "group-hover:from-teal-600 group-hover:to-cyan-600",
    hoverBg: "from-teal-500/8 via-teal-500/4 to-cyan-500/8",
    textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    hoverBorder: "hover:border-teal-200/80",
    dotColor: "bg-teal-500",
  },
  green: {
    icon: "bg-gradient-to-br from-green-500 to-emerald-600",
    hoverIcon: "group-hover:from-green-600 group-hover:to-emerald-700",
    hoverBg: "from-green-500/8 via-green-500/4 to-emerald-500/8",
    textHover: "group-hover:text-green-600 dark:group-hover:text-emerald-400",
    hoverBorder: "hover:border-green-200/80",
    dotColor: "bg-green-500",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    hoverIcon: "group-hover:from-indigo-600 group-hover:to-violet-600",
    hoverBg: "from-indigo-500/8 via-indigo-500/4 to-violet-500/8",
    textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    hoverBorder: "hover:border-indigo-200/80",
    dotColor: "bg-indigo-500",
  },
  pink: {
    icon: "bg-gradient-to-br from-pink-500 to-rose-500",
    hoverIcon: "group-hover:from-pink-600 group-hover:to-rose-600",
    hoverBg: "from-pink-500/8 via-pink-500/4 to-rose-500/8",
    textHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
    hoverBorder: "hover:border-pink-200/80",
    dotColor: "bg-pink-500",
  },
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-600",
    hoverIcon: "group-hover:from-blue-600 group-hover:to-indigo-600",
    hoverBg: "from-blue-500/8 via-blue-500/4 to-indigo-500/8",
    textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    hoverBorder: "hover:border-blue-200/80",
    dotColor: "bg-blue-500",
  },
  purple: {
    icon: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    hoverIcon: "group-hover:from-purple-600 group-hover:to-fuchsia-600",
    hoverBg: "from-purple-500/8 via-purple-500/4 to-fuchsia-500/8",
    textHover: "group-hover:text-purple-600 dark:group-hover:text-fuchsia-400",
    hoverBorder: "hover:border-purple-200/80",
    dotColor: "bg-purple-500",
  },
  default: {
    icon: "bg-gradient-to-br from-orange-500 to-orange-600",
    hoverIcon: "group-hover:from-orange-600 group-hover:to-red-500",
    hoverBg: "from-orange-500/8 via-orange-500/4 to-red-500/8",
    textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    hoverBorder: "hover:border-orange-200/80",
    dotColor: "bg-orange-500",
  },
};

function getGradient(color?: string) {
  return COLOR_GRADIENTS[color || ""] || COLOR_GRADIENTS.default;
}

export function QuizNavPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const category = BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg max-w-sm mx-auto">
            <p className="text-slate-600 mb-6 text-base sm:text-lg">
              Category not found.
            </p>
            <button
              onClick={() => navigate("/dashboard/best-practices")}
              className="w-full px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all hover:cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category.key as BestPracticeCategoryKey);
  const gradient = getGradient(category.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(`/dashboard/best-practices?mode=quiz`)}
            className="group inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 text-slate-600 hover:text-slate-900 transition-all duration-300 hover:cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-50/80 transition-all duration-300">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:-translate-x-0.5 transition-transform duration-300" />
            </div>
            <span className="font-medium text-sm sm:text-base">
              Back to Hub
            </span>
          </button>

          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${gradient.icon} ${gradient.hoverIcon} shadow-lg p-2.5 sm:p-3 lg:p-3.5`}
              >
                <CategoryIcon className="w-full h-full text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm lg:text-base">
                  Quiz Center
                </p>
              </div>
            </div>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-0">
              Test your knowledge and enhance your expertise in{" "}
              {category.name.toLowerCase()}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className={`grid grid-cols-1 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto ${hasPermission("MANAGE:QUIZZES") ? "lg:grid-cols-3" : ""}`}>
            {/* Take Quiz Card - Priority placement */}
            <div className={hasPermission("MANAGE:QUIZZES") ? "lg:col-span-2" : ""}>
              <button
                onClick={() =>
                  navigate(
                    `/dashboard/best-practices/category/${category.key}/quiz/start`
                  )
                }
                className="group w-full h-full bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-orange-200/80 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] hover:cursor-pointer"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 h-full justify-center">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl ${gradient.icon} ${gradient.hoverIcon} shadow-lg p-4 sm:p-5 lg:p-6`}
                  >
                    <Play className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                      Take Quiz
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto">
                      Challenge yourself with randomized questions and track
                      your progress through interactive assessments
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Interactive Assessment
                  </div>
                </div>
              </button>
            </div>

            {/* Question Bank Card - Only show for users with MANAGE:QUIZZES permission */}
            {hasPermission("MANAGE:QUIZZES") && (
              <div className="lg:col-span-1">
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/best-practices/category/${category.key}/quiz/question-bank`
                    )
                  }
                  className={`group w-full h-full bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${gradient.hoverBorder} min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] hover:cursor-pointer`}
                >
                  <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 h-full justify-center">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${gradient.icon} ${gradient.hoverIcon} shadow-lg p-3.5 sm:p-4`}
                    >
                      <Database className="w-full h-full text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-xl font-bold text-slate-900 mb-2">
                        Question Bank
                      </h3>
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Browse, create, and manage quiz questions for this
                        category
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                      <div
                        className={`w-1.5 h-1.5 ${gradient.dotColor} rounded-full`}
                      ></div>
                      Content Management
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats - Full width on large screens */}
          <div className="mt-8 sm:mt-12 lg:mt-16 bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/50 shadow-lg max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                  10
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 leading-tight">
                  Questions Available
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 border-l border-r border-slate-200">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                  5 min
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 leading-tight">
                  Average Quiz Time
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                  85%
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 leading-tight">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
