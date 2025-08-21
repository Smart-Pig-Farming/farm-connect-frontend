import { useState } from "react";
import { CategoryGrid } from "@/components/bestPractices/CategoryGrid";
import { CategoryView } from "@/components/bestPractices/CategoryView";
import { ContentWizard } from "@/components/bestPractices/ContentWizard";
import { QuestionWizard } from "@/components/bestPractices/QuestionWizard";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
  QuizQuestionDraft,
} from "@/types/bestPractices";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="p-4 md:p-8">
        {/* Hero Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Best Practices Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                Master pig farming with structured guidance across eight core
                areas. Create content, take quizzes, and track your expertise.
              </p>
            </div>

            {/* Mode Toggle - Redesigned */}
            <div className="flex items-center gap-3">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                <button
                  onClick={() => {
                    setMode("learn");
                    setSelectedCategory(null);
                  }}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                    mode === "learn"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Learn
                </button>
                <button
                  onClick={() => {
                    setMode("quiz");
                    setSelectedCategory(null);
                  }}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                    mode === "quiz"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Quiz
                </button>
              </div>

              {/* Centralized Add Button */}
              <button
                onClick={() =>
                  mode === "learn"
                    ? setOpenContentWizard(true)
                    : setOpenQuestionWizard(true)
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 transform hover:scale-105 hover:cursor-pointer"
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
                Add New {mode === "learn" ? "Practice" : "Question"}
              </button>
            </div>
          </div>

          {!selectedCategory && (
            <CategoryGrid
              mode={mode}
              onSelect={(c) => setSelectedCategory(c)}
            />
          )}

          {selectedCategory && (
            <div className="mt-8">
              <CategoryView
                category={selectedCategory}
                mode={mode}
                contents={filteredContents}
                questions={filteredQuestions}
                onAddContent={() => setOpenContentWizard(true)}
                onAddQuestion={() => setOpenQuestionWizard(true)}
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
