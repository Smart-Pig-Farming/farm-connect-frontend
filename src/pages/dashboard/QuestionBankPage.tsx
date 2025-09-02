import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  FileQuestion,
  FileText,
} from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import { getCategoryIcon } from "@/components/bestPractices/iconMap";
import type { QuizQuestionDraft } from "@/types/bestPractices";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";
import {
  useListQuizzesQuery,
  useListQuestionsByTagQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useCreateQuizMutation,
  useGetQuizTagStatsQuery,
  useUpdateQuizMutation,
} from "@/store/api/quizApi";
import { toast } from "sonner";
import { QuestionWizard } from "@/components/bestPractices/QuestionWizard";
import { EditQuestionWizard } from "@/components/bestPractices/EditQuestionWizard";

// Category colors matching LiveQuizPage
const getCategoryColors = (color?: string) => {
  const colorMap = {
    green: {
      primary: "from-green-500 to-emerald-600",
      accent: "green-500",
      light: "green-50",
      bg: "from-green-50 via-white to-emerald-50/30",
    },
    red: {
      primary: "from-red-500 to-red-600",
      accent: "red-500",
      light: "red-50",
      bg: "from-red-50 via-white to-red-50/30",
    },
    teal: {
      primary: "from-teal-500 to-teal-600",
      accent: "teal-500",
      light: "teal-50",
      bg: "from-teal-50 via-white to-teal-50/30",
    },
    indigo: {
      primary: "from-indigo-500 to-indigo-600",
      accent: "indigo-500",
      light: "indigo-50",
      bg: "from-indigo-50 via-white to-indigo-50/30",
    },
    purple: {
      primary: "from-purple-500 to-fuchsia-600",
      accent: "purple-500",
      light: "purple-50",
      bg: "from-purple-50 via-white to-fuchsia-50/30",
    },
    pink: {
      primary: "from-pink-500 to-rose-500",
      accent: "pink-500",
      light: "pink-50",
      bg: "from-pink-50 via-white to-rose-50/30",
    },
    blue: {
      primary: "from-blue-500 to-blue-600",
      accent: "blue-500",
      light: "blue-50",
      bg: "from-blue-50 via-white to-blue-50/30",
    },
    amber: {
      primary: "from-amber-500 to-amber-600",
      accent: "amber-500",
      light: "amber-50",
      bg: "from-amber-50 via-white to-amber-50/30",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.amber;
};

export function QuestionBankPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const category = BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);
  // RTK Query hooks (declare before any conditional returns)
  const [updateQuiz] = useUpdateQuizMutation();
  const [questions] = useState<QuizQuestionDraft[]>([]); // deprecated local storage
  const [editing, setEditing] = useState<QuizQuestionDraft | null>(null);
  const [openWizard, setOpenWizard] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    question: QuizQuestionDraft | null;
  }>({
    show: false,
    question: null,
  });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    question: QuizQuestionDraft | null;
  }>({
    show: false,
    question: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Filters & search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]); // values: easy, medium, hard
  const [typeFilter, setTypeFilter] = useState<string[]>([]); // values: mcq, multi, truefalse (legacy 'boolean' mapped)
  // Map any legacy 'boolean' value (old UI) to new enum 'truefalse'
  useEffect(() => {
    if (typeFilter.some((t) => t === "boolean")) {
      setTypeFilter((prev) =>
        prev.map((t) => (t === "boolean" ? "truefalse" : t))
      );
    }
  }, [typeFilter]);
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);
  // Map category key to display name used by quiz tag names
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
  const expectedTagName = category ? tagNameMap[category.key] : undefined;
  interface QuizTagStat {
    tag_id: number;
    tag_name: string;
    quiz_count: number;
    question_count: number;
  }
  // More reliable resolution: get tag stats -> derive tag_id -> fetch quiz by tag_id
  const { data: tagStats } = useGetQuizTagStatsQuery();
  const resolvedTagId = tagStats?.tags.find(
    (t: QuizTagStat) => t.tag_name === expectedTagName
  )?.tag_id;
  // When no quiz exists yet we may auto-create one and store its id
  const [forcedQuizId, setForcedQuizId] = useState<number | null>(null);
  const {
    data: quizzesData,
    isError: quizListError,
    isFetching: isFetchingQuiz,
  } = useListQuizzesQuery(
    {
      active: true,
      any_tag_id: resolvedTagId,
      limit: 1,
    },
    { skip: !resolvedTagId }
  );
  const quizId = quizzesData?.items?.[0]?.id;
  const effectiveQuizId = quizId || forcedQuizId || 0;
  const offset = (currentPage - 1) * pageSize;
  // Aggregate view: use tag aggregate endpoint so legacy multiple quizzes all show
  const {
    data: backendQuestions,
    isError: listError,
    isFetching,
  } = useListQuestionsByTagQuery(
    {
      any_tag_id: resolvedTagId,
      limit: pageSize,
      offset,
      search: debouncedSearch || undefined,
      difficulty:
        difficultyFilter.length > 0 ? difficultyFilter.join(",") : undefined,
      type: typeFilter.length > 0 ? typeFilter.join(",") : undefined,
    },
    { skip: !resolvedTagId }
  );
  const totalBackend = backendQuestions?.pageInfo.total || 0;
  const usingBackend = !!backendQuestions; // aggregate endpoint drives display even before quiz creation

  // Wait for quizId; no local data fallback now

  useEffect(() => {
    if (quizListError) toast.error("Failed to load quizzes");
    if (listError) toast.error("Failed to load questions");
  }, [quizListError, listError]);

  // Pagination calculations (backend vs local)
  const totalPages = usingBackend
    ? Math.max(1, Math.ceil(totalBackend / pageSize))
    : Math.max(1, Math.ceil(questions.length / pageSize));
  const startIndex = offset;
  const currentQuestions: QuizQuestionDraft[] = usingBackend
    ? backendQuestions!.items.map(
        (
          q: (typeof backendQuestions.items)[number] & { question_id?: number }
        ) => ({
          id: String(q.question_id ?? q.id),
          category: category!.key as BestPracticeCategoryKey,
          prompt: q.text,
          type: q.type as QuizQuestionDraft["type"],
          choices: q.options.map((o) => ({
            id: String(o.id),
            text: o.text,
            correct: !!o.is_correct,
          })),
          explanation: q.explanation || undefined,
          difficulty: q.difficulty as "easy" | "medium" | "hard",
          media: undefined,
          status: "saved" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      )
    : questions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mutation hooks must be declared before any conditional returns
  const [createQuestion] = useCreateQuizQuestionMutation();
  const [updateQuestion] = useUpdateQuizQuestionMutation();
  const [deleteQuestionMutation] = useDeleteQuizQuestionMutation();
  const [createQuiz, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/30">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-500 to-slate-600 shadow-lg p-4">
              <FileQuestion className="w-full h-full text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Category Not Found
            </h2>
            <p className="text-slate-600 mb-8">
              The requested category could not be found. Please check the URL or
              return to the main hub.
            </p>
            <button
              onClick={() => navigate("/dashboard/best-practices")}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const colors = getCategoryColors(category.color);
  const CategoryIcon = getCategoryIcon(category.key as BestPracticeCategoryKey);
  const handleDelete = (question: QuizQuestionDraft) =>
    setDeleteModal({ show: true, question });

  const handleView = (question: QuizQuestionDraft) => {
    setViewModal({ show: true, question });
  };

  const confirmDelete = async () => {
    if (deleteModal.question && effectiveQuizId) {
      try {
        await deleteQuestionMutation({
          id: deleteModal.question.id,
          quizId: effectiveQuizId,
        });
      } catch {
        /* mutation toast handles error */
      }
    }
    setDeleteModal({ show: false, question: null });
  };

  const handleSave = async (draft: QuizQuestionDraft) => {
    if (!effectiveQuizId) {
      toast.error("Quiz not found for this category");
      return;
    }
    // Align with BestPracticesPage: ensure quiz tags reflect selected categories (multi-category)
    try {
      const categoryKeys =
        draft.categories && draft.categories.length > 0
          ? draft.categories
          : [draft.category];
      const tagNameMapLocal: Record<string, string> = {
        feeding_nutrition: "Feeding & Nutrition",
        disease_control: "Disease Control",
        growth_weight: "Growth & Weight Mgmt",
        environment_management: "Environment Mgmt",
        breeding_insemination: "Breeding & Insemination",
        farrowing_management: "Farrowing Mgmt",
        record_management: "Record & Farm Mgmt",
        marketing_finance: "Marketing & Finance",
      };
      const existingQuiz = quizzesData?.items?.[0];
      const existingTagIds = new Set<number>(
        [
          ...(existingQuiz?.tags?.map((t) => t.id) || []),
          existingQuiz?.best_practice_tag_id,
        ].filter(Boolean) as number[]
      );
      const resolvedTagIds: number[] = [];
      const tagStatsRows = tagStats?.tags || [];
      for (const key of categoryKeys) {
        const name = tagNameMapLocal[key];
        const tagId = tagStatsRows.find((t) => t.tag_name === name)?.tag_id;
        if (tagId) resolvedTagIds.push(tagId);
      }
      const uniqueIncoming = Array.from(new Set(resolvedTagIds));
      const tagsChanged =
        uniqueIncoming.length > 0 &&
        (uniqueIncoming.length !== existingTagIds.size ||
          uniqueIncoming.some((id) => !existingTagIds.has(id)));
      if (tagsChanged) {
        await updateQuiz({
          id: effectiveQuizId,
          tag_ids: uniqueIncoming,
          primary_tag_id: uniqueIncoming[0],
        }).unwrap();
      }
    } catch (e) {
      // Non-fatal; proceed to question creation
      console.warn("[QuestionBankPage] quiz tag sync failed", e);
    }
    const opts = draft.choices.map((c, i) => ({
      text: c.text,
      is_correct: c.correct,
      order_index: i,
    }));
    try {
      if (editing) {
        await updateQuestion({
          id: editing.id,
          quizId: effectiveQuizId,
          text: draft.prompt,
          explanation: draft.explanation,
          type: draft.type,
          difficulty: draft.difficulty,
          options: opts,
        });
      } else {
        await createQuestion({
          quizId: effectiveQuizId,
          text: draft.prompt,
          explanation: draft.explanation,
          options: opts,
        });
      }
      setOpenWizard(false);
      setEditing(null);
    } catch {
      /* mutation layer toasts errors */
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category.key}/quiz`
                )
              }
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group hover:cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Quiz Center</span>
            </button>

            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg p-4 flex-shrink-0`}
                >
                  <CategoryIcon className="w-full h-full text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Question Bank
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">{category.name}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!effectiveQuizId) {
                    if (isCreatingQuiz) return;
                    if (!resolvedTagId) {
                      toast.error("Category tag not resolved yet");
                      return;
                    }
                    try {
                      const title = `${category.name} Quiz`;
                      const res = await createQuiz({
                        title,
                        description: `Auto-created quiz for ${category.name} question bank`,
                        passing_score: 70,
                        duration: 15,
                        tag_ids: [resolvedTagId],
                        primary_tag_id: resolvedTagId,
                        is_active: true,
                      }).unwrap();
                      const newId = (res as { quiz?: { id?: number } })?.quiz
                        ?.id;
                      if (newId) {
                        setForcedQuizId(newId);
                        toast.success(
                          "Quiz initialized. You can add a question now."
                        );
                        setEditing(null);
                        setOpenWizard(true);
                      } else {
                        toast.error("Quiz creation response missing id");
                      }
                    } catch (e: unknown) {
                      const apiErr = e as
                        | { data?: { error?: string } }
                        | undefined;
                      toast.error(
                        apiErr?.data?.error || "Failed to create quiz"
                      );
                    }
                    return;
                  }
                  setEditing(null);
                  setOpenWizard(true);
                }}
                disabled={!effectiveQuizId && isCreatingQuiz}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  effectiveQuizId
                    ? `bg-gradient-to-r ${colors.primary} text-white hover:shadow-xl hover:scale-[1.02]`
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isCreatingQuiz ? (
                  <span className="text-sm animate-pulse">Init...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Question</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats & Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colors.primary} p-2`}
                  >
                    <BookOpen className="w-full h-full text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {usingBackend ? totalBackend : 0}
                    </div>
                    <div className="text-sm text-slate-600">
                      Total Questions
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 flex-1">
                  Manage quiz questions for the{" "}
                  <span className="font-medium text-slate-900">
                    {category.name}
                  </span>{" "}
                  category
                </div>
              </div>
              {!effectiveQuizId && !isFetchingQuiz && !isCreatingQuiz && (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-amber-700 text-sm flex items-start gap-3">
                  <span className="font-semibold">Quiz not found:</span>
                  <span>
                    No active quiz yet. Click "Add Question" to auto-create a
                    quiz and start adding questions.
                  </span>
                </div>
              )}
              {isCreatingQuiz && (
                <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 px-4 py-3 text-indigo-700 text-sm flex items-start gap-3 animate-pulse">
                  <span className="font-semibold">Initializing quiz...</span>
                  <span>Setting up a new quiz for this category.</span>
                </div>
              )}

              {/* Primary Search Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Search & Filter Questions
                  </h3>
                  {(difficultyFilter.length > 0 ||
                    typeFilter.length > 0 ||
                    debouncedSearch) && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {difficultyFilter.length +
                        typeFilter.length +
                        (debouncedSearch ? 1 : 0)}{" "}
                      filter(s) active
                    </span>
                  )}
                </div>

                {/* Search Bar - Primary Focus */}
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search questions by content, tags, or keywords..."
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 pr-12 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {debouncedSearch ? (
                      <button
                        onClick={() => {
                          setSearch("");
                          setDebouncedSearch("");
                        }}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        ✕ Clear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Secondary Filter Section */}
              <div className="space-y-6 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Difficulty Filter */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Difficulty Level
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(["easy", "medium", "hard"] as const).map((d) => {
                        const active = difficultyFilter.includes(d);
                        const difficultyColors = {
                          easy: active
                            ? "bg-green-500 text-white border-green-500 shadow-green-200/50"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300",
                          medium: active
                            ? "bg-amber-500 text-white border-amber-500 shadow-amber-200/50"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
                          hard: active
                            ? "bg-red-500 text-white border-red-500 shadow-red-200/50"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300",
                        };

                        return (
                          <button
                            key={d}
                            onClick={() => {
                              setCurrentPage(1);
                              setDifficultyFilter((prev) =>
                                prev.includes(d)
                                  ? prev.filter((x) => x !== d)
                                  : [...prev, d]
                              );
                            }}
                            className={`
                              px-4 py-2.5 rounded-full text-sm font-medium border-2 
                              transition-all duration-200 ease-out hover:cursor-pointer 
                              transform hover:scale-105 active:scale-95
                              ${
                                active
                                  ? "shadow-lg"
                                  : "shadow-sm hover:shadow-md"
                              }
                              ${difficultyColors[d]}
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400
                              min-w-[80px]
                            `}
                          >
                            {d.charAt(0).toUpperCase() + d.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Question Type
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(
                        [
                          { key: "mcq", label: "Single Choice", icon: "●" },
                          { key: "multi", label: "Multiple Choice", icon: "☰" },
                          { key: "truefalse", label: "True/False", icon: "⚖" },
                        ] as const
                      ).map((t) => {
                        const active = typeFilter.includes(t.key);
                        return (
                          <button
                            key={t.key}
                            onClick={() => {
                              setCurrentPage(1);
                              setTypeFilter((prev) =>
                                prev.includes(t.key)
                                  ? prev.filter((x) => x !== t.key)
                                  : [...prev, t.key]
                              );
                            }}
                            className={`
                              px-4 py-2.5 rounded-full text-sm font-medium border-2 
                              transition-all duration-200 ease-out hover:cursor-pointer
                              transform hover:scale-105 active:scale-95
                              flex items-center gap-2
                              ${
                                active
                                  ? "shadow-lg"
                                  : "shadow-sm hover:shadow-md"
                              }
                              ${
                                active
                                  ? "bg-indigo-500 text-white border-indigo-500 shadow-indigo-200/50"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
                              }
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
                              min-w-[120px] sm:min-w-[140px]
                            `}
                          >
                            <span className="text-xs opacity-80">{t.icon}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                            <span className="sm:hidden">
                              {t.label.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Clear All Filters */}
                {(difficultyFilter.length > 0 ||
                  typeFilter.length > 0 ||
                  debouncedSearch) && (
                  <div className="flex justify-center lg:justify-start">
                    <button
                      onClick={() => {
                        setSearch("");
                        setDebouncedSearch("");
                        setDifficultyFilter([]);
                        setTypeFilter([]);
                        setCurrentPage(1);
                      }}
                      className="
                        px-6 py-2.5 rounded-full text-sm font-medium 
                        bg-slate-100 text-slate-600 border-2 border-slate-200 
                        hover:bg-slate-200 hover:border-slate-300 hover:cursor-pointer
                        transition-all duration-200 ease-out
                        transform hover:scale-105 active:scale-95
                        shadow-sm hover:shadow-md
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400
                        flex items-center gap-2
                      "
                    >
                      <span>✕</span>
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
              {(isFetching || isFetchingQuiz) && (
                <div className="text-xs text-slate-500 animate-pulse">
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Questions List */}
          {(usingBackend ? totalBackend === 0 : questions.length === 0) ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/50 shadow-lg max-w-md mx-auto">
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg p-5`}
                >
                  <FileQuestion className="w-full h-full text-white" />
                </div>
                {effectiveQuizId ? (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      No Questions Yet
                    </h3>
                    <p className="text-slate-600 mb-8">
                      Start building your question bank by adding your first
                      quiz question.
                    </p>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setOpenWizard(true);
                      }}
                      className={`px-8 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer`}
                    >
                      Create First Question
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Quiz Not Initialized
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Click below (or "Add Question") to auto-create a quiz for
                      this category.
                    </p>
                    <button
                      onClick={async () => {
                        if (isCreatingQuiz) return;
                        if (!resolvedTagId) {
                          toast.error("Category tag not resolved yet");
                          return;
                        }
                        try {
                          const res = await createQuiz({
                            title: `${category.name} Quiz`,
                            description: `Auto-created quiz for ${category.name} question bank`,
                            passing_score: 70,
                            duration: 15,
                            tag_ids: [resolvedTagId],
                            primary_tag_id: resolvedTagId,
                            is_active: true,
                          }).unwrap();
                          const newId = (res as { quiz?: { id?: number } })
                            ?.quiz?.id;
                          if (newId) {
                            setForcedQuizId(newId);
                            toast.success(
                              "Quiz initialized. Add your first question."
                            );
                            setEditing(null);
                            setOpenWizard(true);
                          }
                        } catch (e: unknown) {
                          const apiErr = e as
                            | { data?: { error?: string } }
                            | undefined;
                          toast.error(
                            apiErr?.data?.error || "Failed to create quiz"
                          );
                        }
                      }}
                      className={`px-8 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer`}
                    >
                      Initialize Quiz
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Questions Grid */}
              <div className="grid gap-4">
                {currentQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colors.primary} flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <span className="text-white font-bold text-sm">
                            {startIndex + index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 text-lg leading-relaxed">
                            {q.prompt}
                          </h3>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium bg-${colors.light} text-${colors.accent} border border-${colors.accent}/20`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {q.type}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {q.choices.length} choices
                            </span>
                          </div>

                          <div className="text-sm text-slate-500">
                            {q.choices.filter((c) => c.correct).length} correct
                            answer
                            {q.choices.filter((c) => c.correct).length !== 1
                              ? "s"
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleView(q)}
                          className={`p-3 rounded-xl bg-blue-50 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-200 hover:border-blue-500 font-medium transition-all duration-200 hover:cursor-pointer hover:shadow-md`}
                          title="View Question Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(q);
                            setOpenWizard(true);
                          }}
                          className={`p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 font-medium transition-all duration-200 hover:cursor-pointer hover:shadow-sm`}
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q)}
                          className="p-3 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 font-medium transition-all duration-200 hover:cursor-pointer hover:shadow-md"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {usingBackend ? (
                        <>
                          Showing {startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + currentQuestions.length,
                            totalBackend
                          )}{" "}
                          of {totalBackend} questions
                        </>
                      ) : (
                        <>
                          Showing {startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + currentQuestions.length,
                            questions.length
                          )}{" "}
                          of {questions.length} questions
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                          currentPage === 1
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : `bg-gradient-to-r ${colors.primary} text-white hover:shadow-md hover:scale-105`
                        }`}
                      >
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                              currentPage === page
                                ? `bg-gradient-to-r ${colors.primary} text-white shadow-md`
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                          currentPage === totalPages
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : `bg-gradient-to-r ${colors.primary} text-white hover:shadow-md hover:scale-105`
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Wizard for Create */}
          {openWizard && !editing && (
            <QuestionWizard
              open={openWizard}
              onClose={() => {
                setOpenWizard(false);
                setEditing(null);
              }}
              onSave={handleSave}
              initial={{ category: category.key }}
            />
          )}

          {/* Edit Question Wizard for Edit */}
          {openWizard && editing && (
            <EditQuestionWizard
              open={openWizard}
              onClose={() => {
                setOpenWizard(false);
                setEditing(null);
              }}
              onSave={handleSave}
              question={editing}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteModal.show && deleteModal.question && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Delete Question?
                  </h3>
                </div>

                <div className="mb-4">
                  <p className="text-slate-600 mb-3 leading-relaxed">
                    Are you sure you want to delete this question? This action
                    cannot be undone.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {deleteModal.question.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ show: false, question: null })
                    }
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors hover:cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Question Details Modal */}
          {viewModal.show && viewModal.question && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${colors.primary} flex items-center justify-center`}
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Question Details
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Question Information */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Question
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-lg">
                        {viewModal.question.prompt}
                      </p>
                    </div>

                    {/* Question Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm text-slate-500 mb-1">Type</div>
                        <div className="font-semibold text-slate-900 capitalize">
                          {viewModal.question.type === "mcq"
                            ? "Multiple Choice (Single)"
                            : viewModal.question.type === "multi"
                            ? "Multiple Choice (Multi)"
                            : "True/False"}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm text-slate-500 mb-1">
                          Difficulty
                        </div>
                        <div
                          className={`font-semibold capitalize ${
                            viewModal.question.difficulty === "easy"
                              ? "text-green-600"
                              : viewModal.question.difficulty === "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {viewModal.question.difficulty}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm text-slate-500 mb-1">
                          Correct Answers
                        </div>
                        <div className="font-semibold text-slate-900">
                          {
                            viewModal.question.choices.filter((c) => c.correct)
                              .length
                          }{" "}
                          of {viewModal.question.choices.length}
                        </div>
                      </div>
                    </div>

                    {/* Answer Choices */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Answer Choices
                      </h4>
                      <div className="space-y-3">
                        {viewModal.question.choices.map((choice, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              choice.correct
                                ? "bg-green-50 border-green-200 text-green-900"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                  choice.correct
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-300 text-slate-700"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <div className="flex-1">
                                <p className="leading-relaxed">{choice.text}</p>
                                {choice.correct && (
                                  <div className="text-sm text-green-600 font-medium mt-1">
                                    ✓ Correct Answer
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    {viewModal.question.explanation && (
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4">
                          Explanation
                        </h4>
                        <p className="text-blue-800 leading-relaxed">
                          {viewModal.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() =>
                        setViewModal({ show: false, question: null })
                      }
                      className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors hover:cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setViewModal({ show: false, question: null });
                        setEditing(viewModal.question);
                        setOpenWizard(true);
                      }}
                      className={`flex-1 px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:cursor-pointer`}
                    >
                      Edit Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
