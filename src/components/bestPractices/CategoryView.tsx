import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import { getCategoryIcon } from "./iconMap";

interface CategoryViewProps {
  category: BestPracticeCategory;
  mode: "learn" | "quiz";
  contents: BestPracticeContentDraft[];
  questions: QuizQuestionDraft[];
  onAddContent: () => void;
  onAddQuestion: () => void;
  onBack: () => void;
}

export const CategoryView = ({
  category,
  mode,
  contents,
  questions,
  onAddContent,
  onAddQuestion,
  onBack,
}: CategoryViewProps) => {
  const Icon = getCategoryIcon(category.key as "feeding_nutrition");
  const itemCount = mode === "learn" ? contents.length : questions.length;

  const colorStem = category.color || "orange";
  // Basic mapping of color stems to gradient classes
  const categoryGradients: Record<
    string,
    {
      block: string;
      button: string;
      buttonHover: string;
      ring: string;
      textHover: string;
      subtle: string;
      dot: string;
    }
  > = {
    amber: {
      block: "from-amber-500 to-amber-600",
      button: "from-amber-500 to-amber-600",
      buttonHover:
        "hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25 hover:shadow-amber-500/40",
      ring: "focus:ring-amber-500",
      textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
      subtle: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    red: {
      block: "from-red-500 to-red-600",
      button: "from-red-500 to-red-600",
      buttonHover:
        "hover:from-red-600 hover:to-rose-600 shadow-red-500/25 hover:shadow-red-500/40",
      ring: "focus:ring-red-500",
      textHover: "group-hover:text-red-600 dark:group-hover:text-red-400",
      subtle: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    },
    teal: {
      block: "from-teal-500 to-teal-600",
      button: "from-teal-500 to-teal-600",
      buttonHover:
        "hover:from-teal-600 hover:to-cyan-600 shadow-teal-500/25 hover:shadow-teal-500/40",
      ring: "focus:ring-teal-500",
      textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
      subtle: "text-teal-600 dark:text-teal-400",
      dot: "bg-teal-500",
    },
    green: {
      block: "from-green-500 to-emerald-600",
      button: "from-green-500 to-emerald-600",
      buttonHover:
        "hover:from-green-600 hover:to-emerald-700 shadow-green-500/25 hover:shadow-green-500/40",
      ring: "focus:ring-green-500",
      textHover: "group-hover:text-green-600 dark:group-hover:text-emerald-400",
      subtle: "text-green-600 dark:text-emerald-400",
      dot: "bg-green-500",
    },
    indigo: {
      block: "from-indigo-500 to-indigo-600",
      button: "from-indigo-500 to-indigo-600",
      buttonHover:
        "hover:from-indigo-600 hover:to-violet-600 shadow-indigo-500/25 hover:shadow-indigo-500/40",
      ring: "focus:ring-indigo-500",
      textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
      subtle: "text-indigo-600 dark:text-indigo-400",
      dot: "bg-indigo-500",
    },
    pink: {
      block: "from-pink-500 to-rose-500",
      button: "from-pink-500 to-rose-500",
      buttonHover:
        "hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25 hover:shadow-pink-500/40",
      ring: "focus:ring-pink-500",
      textHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
      subtle: "text-pink-600 dark:text-pink-400",
      dot: "bg-pink-500",
    },
    blue: {
      block: "from-blue-500 to-blue-600",
      button: "from-blue-500 to-blue-600",
      buttonHover:
        "hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40",
      ring: "focus:ring-blue-500",
      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      subtle: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    purple: {
      block: "from-purple-500 to-fuchsia-600",
      button: "from-purple-500 to-fuchsia-600",
      buttonHover:
        "hover:from-purple-600 hover:to-fuchsia-600 shadow-purple-500/25 hover:shadow-purple-500/40",
      ring: "focus:ring-purple-500",
      textHover:
        "group-hover:text-purple-600 dark:group-hover:text-fuchsia-400",
      subtle: "text-purple-600 dark:text-fuchsia-400",
      dot: "bg-purple-500",
    },
    orange: {
      block: "from-orange-500 to-orange-600",
      button: "from-orange-500 to-orange-600",
      buttonHover:
        "hover:from-orange-600 hover:to-red-600 shadow-orange-500/25 hover:shadow-orange-500/40",
      ring: "focus:ring-orange-500",
      textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
      subtle: "text-orange-600 dark:text-orange-400",
      dot: "bg-orange-500",
    },
  };

  const g = categoryGradients[colorStem] || categoryGradients.orange;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Category Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 group hover:cursor-pointer"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Categories
        </button>

        <div className="flex items-center gap-6 mb-6">
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${g.block} shadow-lg`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {category.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${g.dot}`} />
                {itemCount} {mode === "learn" ? "practices" : "questions"}
              </span>
              <span>•</span>
              <span>{mode === "learn" ? "Learning Mode" : "Quiz Mode"}</span>
            </div>
          </div>

          <button
            onClick={mode === "learn" ? onAddContent : onAddQuestion}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer bg-gradient-to-r ${g.button} ${g.buttonHover} text-white`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add {mode === "learn" ? "Practice" : "Question"}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mode === "learn" &&
          contents.map((c) => (
            <div
              key={c.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105 ring-1 ring-slate-200 dark:ring-slate-700 hover:cursor-pointer"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.block} flex items-center justify-center`}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    Practice
                  </span>
                </div>
                <h3
                  className={`font-semibold text-slate-900 dark:text-white line-clamp-2 transition-colors ${g.textHover}`}
                >
                  {c.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-2">
                  {c.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {c.steps.length} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {c.benefits.length} benefits
                  </span>
                </div>
              </div>
            </div>
          ))}

        {mode === "quiz" &&
          questions.map((q) => (
            <div
              key={q.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105 ring-1 ring-slate-200 dark:ring-slate-700 hover:cursor-pointer"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.block} flex items-center justify-center`}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        q.difficulty === "easy"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : q.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <h3
                  className={`font-semibold text-slate-900 dark:text-white line-clamp-2 transition-colors ${g.textHover}`}
                >
                  {q.prompt}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {q.type.toUpperCase()} • Multiple choice question
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {q.choices.filter((c) => c.correct).length} correct
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {q.choices.length} choices
                  </span>
                </div>
              </div>
            </div>
          ))}

        {/* Empty States */}
        {mode === "learn" && contents.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <div
                className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${g.block} rounded-2xl flex items-center justify-center`}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No practices yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create your first best practice guide for{" "}
                {category.name.toLowerCase()}
              </p>
              <button
                onClick={onAddContent}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${g.button} ${g.buttonHover} text-white rounded-2xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Practice
              </button>
            </div>
          </div>
        )}

        {mode === "quiz" && questions.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <div
                className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${g.block} rounded-2xl flex items-center justify-center`}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No questions yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create your first quiz question for{" "}
                {category.name.toLowerCase()}
              </p>
              <button
                onClick={onAddQuestion}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${g.button} ${g.buttonHover} text-white rounded-2xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
