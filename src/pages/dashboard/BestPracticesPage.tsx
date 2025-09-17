import { useEffect, useState, useMemo } from "react";
import { CategoryGrid } from "@/components/bestPractices/CategoryGrid";
import { ContentWizard } from "@/components/bestPractices/ContentWizard";
import { QuestionWizard } from "@/components/bestPractices/QuestionWizard";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { ChatModal } from "@/components/ui/ChatModal";
import { useGetBestPracticeCategoriesQuery } from "@/store/api/bestPracticesApi";
import {
  useGetQuizTagStatsQuery,
  useCreateQuizMutation,
  useCreateQuizQuestionMutation,
} from "@/store/api/quizApi";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import type { QuizQuestionDraft } from "@/types/bestPractices";

// Fallback local type (in case build cannot resolve path during incremental build)
// This will be structurally compatible with the real QuizQuestionDraft for the fields we use.
type _QuizQuestionDraftFallback = {
  category: string;
  categories?: string[];
  choices: { text: string; correct: boolean }[];
  prompt: string;
  explanation?: string;
};
type QuizQuestionDraftLike = QuizQuestionDraft | _QuizQuestionDraftFallback;

// Live practice counts will come from backend categories endpoint

export function BestPracticesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = (
    searchParams.get("mode") === "quiz" ? "quiz" : "learn"
  ) as "learn" | "quiz";
  const [mode, setMode] = useState<"learn" | "quiz">(initialMode);
  const navigate = useNavigate();
  const [openContentWizard, setOpenContentWizard] = useState(false);
  const [openQuestionWizard, setOpenQuestionWizard] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const { data: catData } = useGetBestPracticeCategoriesQuery();
  const practiceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    catData?.categories.forEach((c) => (map[c.key] = c.count));
    return map;
  }, [catData]);

  const handleSaveContent = () => {
    // After create mutation we might refetch categories automatically via tag invalidation
  };
  // Quiz creation pending category route integration
  // Multi-category quiz/question creation logic
  const { data: quizTagStats } = useGetQuizTagStatsQuery();
  const [createQuiz] = useCreateQuizMutation();
  const [createQuestion] = useCreateQuizQuestionMutation();
  // Map category key -> expected tag name used by backend
  const tagNameMap: Record<string, string> = {
    feeding_nutrition: "Feeding & Nutrition",
    disease_control: "Disease Control",
    growth_weight: "Growth & Weight Mgmt",
    environment_management: "Environment Mgmt",
    breeding_insemination: "Breeding & Insemination",
    farrowing_management: "Farrowing Mgmt",
    record_management: "Record & Farm Mgmt",
    marketing_finance: "Marketing & Finance",
  };
  const handleSaveQuestion = async (draft: QuizQuestionDraftLike) => {
    try {
      const cats: string[] =
        draft.categories && draft.categories.length > 0
          ? draft.categories
          : [draft.category];
      const uniqueCats: string[] = Array.from(new Set<string>(cats));
      if (uniqueCats.length === 0) {
        toast.error("No categories selected");
        return;
      }
      const tagRows: Array<{ tag_id: number; tag_name: string }> =
        quizTagStats?.tags || [];
      const options = draft.choices.map((c, i) => ({
        text: c.text,
        is_correct: c.correct,
        order_index: i,
      }));
      // Resolve all tag ids for a single multi-category quiz
      const resolvedTagIds: number[] = [];
      for (const cat of uniqueCats) {
        const name = tagNameMap[cat as keyof typeof tagNameMap];
        const tagId = tagRows.find((t) => t.tag_name === name)?.tag_id;
        if (tagId) {
          resolvedTagIds.push(tagId);
        } else {
          console.warn(`Skipping category ${cat} - tag not resolved`);
        }
      }
      if (resolvedTagIds.length === 0) {
        toast.error("Could not resolve any category tags");
        return;
      }
      const primaryTagId = resolvedTagIds[0];
      const primaryName = tagNameMap[uniqueCats[0] as keyof typeof tagNameMap];
      // Create one quiz tied to all selected categories
      const quizRes = await createQuiz({
        title:
          `${primaryName} Quiz` +
          (resolvedTagIds.length > 1 ? " (+multi)" : ""),
        description:
          resolvedTagIds.length > 1
            ? `Auto-generated multi-category quiz for ${uniqueCats.length} categories`
            : `Auto-generated quiz for ${primaryName}`,
        passing_score: 70,
        duration: 10,
        tag_ids: resolvedTagIds,
        primary_tag_id: primaryTagId,
        is_active: true,
      }).unwrap();
      const quizId = quizRes.quiz.id;
      await createQuestion({
        quizId,
        text: draft.prompt,
        explanation: draft.explanation,
        options,
      }).unwrap();
      toast.success(
        resolvedTagIds.length > 1
          ? `Question created in multi-category quiz (${uniqueCats.length} categories)`
          : "Question created"
      );
      setOpenQuestionWizard(false);
    } catch (e) {
      // Errors surfaced by mutation toasts; fallback message
      console.error("[BestPractices:handleSaveQuestion]", e);
      toast.error("Failed to save question");
    }
  };
  // category selection now triggers navigation

  // Placeholder: existing contents state remains for wizard preview only (will be replaced by API after create)

  // Keep URL in sync when mode changes
  useEffect(() => {
    const current = searchParams.get("mode");
    if (mode === "quiz" && current !== "quiz") {
      setSearchParams({ mode: "quiz" });
    } else if (mode === "learn" && current !== "learn") {
      // default mode can omit param; keep explicit for clarity
      setSearchParams({ mode: "learn" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30">
      <div className="p-4 md:p-8">
        {/* Hero Header */}
        <div className="max-w-6xl mx-auto">
          {/* Show hero + controls only when no category selected */}
          {/* Always show hub hero on this page */}
          <>
            {/* Title & Intro */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-3">
                Best Practices Hub
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                Master pig farming with structured guidance across eight core
                areas. Create content, take quizzes, and track your expertise.
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-stretch lg:items-center mb-8">
              {/* Add Button - Only show for users with MANAGE:BEST_PRACTICES permission */}
              {hasPermission("MANAGE:BEST_PRACTICES") && (
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
              )}

              {/* Mode Toggle */}
              <div className="flex justify-center sm:justify-start lg:ml-auto">
                <div className="relative">
                  {/* Mobile Switch */}
                  <div className="sm:hidden">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-medium transition-colors duration-300 ${
                          mode === "learn"
                            ? "text-orange-600"
                            : "text-slate-400"
                        }`}
                      >
                        Learn
                      </span>
                      <button
                        onClick={() => {
                          setMode(mode === "learn" ? "quiz" : "learn");
                        }}
                        className="relative w-14 h-8 bg-slate-200 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
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
                          mode === "quiz" ? "text-orange-600" : "text-slate-400"
                        }`}
                      >
                        Quiz
                      </span>
                    </div>
                  </div>

                  {/* Desktop Toggle */}
                  <div className="hidden sm:block">
                    <div className="relative bg-white rounded-2xl p-1 shadow-lg ring-1 ring-slate-200">
                      <div className="flex">
                        <button
                          onClick={() => {
                            setMode("learn");
                          }}
                          className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:cursor-pointer ${
                            mode === "learn"
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-105"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          Learn
                        </button>
                        <button
                          onClick={() => {
                            setMode("quiz");
                          }}
                          className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:cursor-pointer ${
                            mode === "quiz"
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-105"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
              practiceCounts={practiceCounts}
              onSelect={(c) => {
                if (mode === "quiz") {
                  // Directly open quiz navigation page for the category
                  navigate(`/dashboard/best-practices/category/${c.key}/quiz`);
                } else {
                  navigate(`/dashboard/best-practices/category/${c.key}`);
                }
              }}
            />
          </>
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

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
