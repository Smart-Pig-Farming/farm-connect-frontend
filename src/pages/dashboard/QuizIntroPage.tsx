import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import { getCategoryIcon } from "@/components/bestPractices/iconMap";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";

// Simplified color system - using category colors throughout
const getCategoryColors = (color?: string) => {
  const colorMap = {
    green: {
      primary: "from-green-500 to-emerald-600",
      hover: "from-green-600 to-emerald-700",
      accent: "green-500",
      light: "green-50",
    },
    red: {
      primary: "from-red-500 to-red-600",
      hover: "from-red-600 to-rose-600",
      accent: "red-500",
      light: "red-50",
    },
    teal: {
      primary: "from-teal-500 to-teal-600",
      hover: "from-teal-600 to-cyan-600",
      accent: "teal-500",
      light: "teal-50",
    },
    indigo: {
      primary: "from-indigo-500 to-indigo-600",
      hover: "from-indigo-600 to-violet-600",
      accent: "indigo-500",
      light: "indigo-50",
    },
    purple: {
      primary: "from-purple-500 to-fuchsia-600",
      hover: "from-purple-600 to-fuchsia-600",
      accent: "purple-500",
      light: "purple-50",
    },
    pink: {
      primary: "from-pink-500 to-rose-500",
      hover: "from-pink-600 to-rose-600",
      accent: "pink-500",
      light: "pink-50",
    },
    blue: {
      primary: "from-blue-500 to-blue-600",
      hover: "from-blue-600 to-indigo-600",
      accent: "blue-500",
      light: "blue-50",
    },
    amber: {
      primary: "from-amber-500 to-amber-600",
      hover: "from-amber-600 to-amber-700",
      accent: "amber-500",
      light: "amber-50",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.amber;
};

export function QuizIntroPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const category = BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);

  if (!category) return null;

  const CategoryIcon = getCategoryIcon(category.key as BestPracticeCategoryKey);
  const colors = getCategoryColors(category.color);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Back Navigation */}
          <button
            onClick={() =>
              navigate(
                `/dashboard/best-practices/category/${category.key}/quiz`
              )
            }
            className={`group inline-flex items-center gap-3 mb-8 lg:mb-12 text-slate-600 hover:text-slate-900 transition-all duration-300 hover:cursor-pointer`}
          >
            <div
              className={`w-8 h-8 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center group-hover:border-${colors.accent}/50 group-hover:bg-${colors.light}/80 transition-all duration-300`}
            >
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-300" />
            </div>
            <span className="font-medium">Back to Quiz Center</span>
          </button>

          {/* Simplified Two-Column Layout */}
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left Column - Category Info (Simplified) */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/50 shadow-lg">
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg p-4`}
                  >
                    <CategoryIcon className="w-full h-full text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {category.name}
                  </h2>
                  <p className="text-slate-600 text-sm">Knowledge Assessment</p>
                </div>

                {/* Quick Stats - Simplified */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Questions</span>
                    <span className="font-semibold">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time</span>
                    <span className="font-semibold">5-8 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Passing</span>
                    <span className="font-semibold">70%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Instructions & Start */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/50 shadow-lg">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-6">
                  Quiz Instructions
                </h1>

                {/* Simplified Instructions */}
                <div className="space-y-4 mb-8 text-slate-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className={`w-5 h-5 text-${colors.accent} flex-shrink-0 mt-0.5`}
                    />
                    <p className="text-sm leading-relaxed">
                      <strong>Format:</strong> 10 randomized multiple-choice
                      questions. Some may have multiple correct answers.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock
                      className={`w-5 h-5 text-${colors.accent} flex-shrink-0 mt-0.5`}
                    />
                    <p className="text-sm leading-relaxed">
                      <strong>Navigation:</strong> Move back and forth between
                      questions. Timer runs continuously.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`w-5 h-5 text-${colors.accent} flex-shrink-0 mt-0.5`}
                    />
                    <p className="text-sm leading-relaxed">
                      <strong>Scoring:</strong> Unanswered questions are marked
                      incorrect. Submit when ready.
                    </p>
                  </div>
                </div>

                {/* Start Button with Category Colors */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/best-practices/category/${category.key}/quiz/live`
                      )
                    }
                    className={`group flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${colors.primary} hover:${colors.hover} text-white rounded-2xl font-semibold shadow-lg shadow-${colors.accent}/25 hover:shadow-${colors.accent}/40 transition-all duration-300 transform hover:scale-[1.02] hover:cursor-pointer`}
                  >
                    <Play className="w-5 h-5" />
                    <span className="text-lg">Start Quiz</span>
                  </button>

                  <p className="text-slate-500 text-sm">
                    Good luck! Read each question carefully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
