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
            className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
              mode === "learn"
                ? "bg-gradient-to-br from-orange-500 to-orange-600"
                : "bg-gradient-to-br from-orange-500 to-orange-600"
            } shadow-lg`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {category.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mode === "learn" ? "bg-orange-500" : "bg-orange-500"
                  }`}
                />
                {itemCount} {mode === "learn" ? "practices" : "questions"}
              </span>
              <span>•</span>
              <span>{mode === "learn" ? "Learning Mode" : "Quiz Mode"}</span>
            </div>
          </div>

          <button
            onClick={mode === "learn" ? onAddContent : onAddQuestion}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer ${
              mode === "learn"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-500/40"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-500/40"
            } text-white`}
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
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
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
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
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 transform hover:scale-105 hover:cursor-pointer"
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
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 transform hover:scale-105 hover:cursor-pointer"
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
