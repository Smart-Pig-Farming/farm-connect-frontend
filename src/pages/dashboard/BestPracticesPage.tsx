import { useEffect, useState } from "react";
import { CategoryGrid } from "@/components/bestPractices/CategoryGrid";
import { CategoryView } from "@/components/bestPractices/CategoryView";
import { ContentWizard } from "@/components/bestPractices/ContentWizard";
import { QuestionWizard } from "@/components/bestPractices/QuestionWizard";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import {
  fetchPracticesPage,
  BEST_PRACTICES_PAGE_SIZE,
} from "@/data/bestPracticesMock";

export function BestPracticesPage() {
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [selectedCategory, setSelectedCategory] =
    useState<BestPracticeCategory | null>(null);
  const [openContentWizard, setOpenContentWizard] = useState(false);
  const [openQuestionWizard, setOpenQuestionWizard] = useState(false);
  const [contents, setContents] = useState<BestPracticeContentDraft[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);

  const filteredContents = selectedCategory
    ? contents.filter((c) => c.categories.includes(selectedCategory.key))
    : contents;
  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category === selectedCategory.key)
    : questions;

  const handleSaveContent = (draft: BestPracticeContentDraft) =>
    setContents((prev) => [...prev, draft]);
  const handleSaveQuestion = (draft: QuizQuestionDraft) =>
    setQuestions((prev) => [...prev, draft]);
  const resetView = () => {
    setSelectedCategory(null);
  };

  // Initial mock load (first page) to show content prior to adding real data source
  useEffect(() => {
    if (contents.length === 0) {
      fetchPracticesPage(0, BEST_PRACTICES_PAGE_SIZE).then((r) =>
        setContents(r.data)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="p-4 md:p-8">
        {/* Hero Header */}
        <div className="max-w-6xl mx-auto">
          {/* Show hero + controls only when no category selected */}
          {!selectedCategory && (
            <>
              {/* Title & Intro */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                  Best Practices Hub
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                  Master pig farming with structured guidance across eight core
                  areas. Create content, take quizzes, and track your expertise.
                </p>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-stretch lg:items-center mb-8">
                {/* Add Button */}
                <button
                  onClick={() =>
                    mode === "learn"
                      ? setOpenContentWizard(true)
                      : setOpenQuestionWizard(true)
                  }
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:cursor-pointer w-full sm:w-auto sm:max-w-fit group"
                >
                  <div className="relative">
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </div>
                  <span className="text-lg">
                    Add New {mode === "learn" ? "Practice" : "Question"}
                  </span>
                </button>

                {/* Mode Toggle */}
                <div className="flex justify-center sm:justify-start lg:ml-auto">
                  <div className="relative">
                    {/* Mobile Switch */}
                    <div className="sm:hidden">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            mode === "learn"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          Learn
                        </span>
                        <button
                          onClick={() => {
                            setMode(mode === "learn" ? "quiz" : "learn");
                            setSelectedCategory(null);
                          }}
                          className="relative w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg transition-all duration-300 transform ${
                              mode === "learn" ? "left-1" : "left-7"
                            }`}
                          >
                            <div className="absolute inset-0 rounded-full bg-white/20" />
                          </div>
                        </button>
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            mode === "quiz"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          Quiz
                        </span>
                      </div>
                    </div>

                    {/* Desktop Toggle */}
                    <div className="hidden sm:block">
                      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                        <div className="flex">
                          <button
                            onClick={() => {
                              setMode("learn");
                              setSelectedCategory(null);
                            }}
                            className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:cursor-pointer ${
                              mode === "learn"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-105"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            Learn
                          </button>
                          <button
                            onClick={() => {
                              setMode("quiz");
                              setSelectedCategory(null);
                            }}
                            className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:cursor-pointer ${
                              mode === "quiz"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-105"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CategoryGrid
                mode={mode}
                onSelect={(c) => setSelectedCategory(c)}
              />
            </>
          )}

          {selectedCategory && (
            <div className="mt-4">
              <CategoryView
                category={selectedCategory}
                mode={mode}
                contents={filteredContents}
                questions={filteredQuestions}
                onBack={resetView}
              />
            </div>
          )}
        </div>
      </div>

      <ContentWizard
        open={openContentWizard}
        onClose={() => setOpenContentWizard(false)}
        onSave={handleSaveContent}
      />
      <QuestionWizard
        open={openQuestionWizard}
        onClose={() => setOpenQuestionWizard(false)}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
