import { useState, useEffect, useRef, useCallback } from "react";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import { getCategoryIcon } from "./iconMap";
import {
  fetchPracticesPage,
  BEST_PRACTICES_PAGE_SIZE,
} from "@/data/bestPracticesMock";
import { useNavigate } from "react-router-dom";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";

interface CategoryViewProps {
  category: BestPracticeCategory;
  mode: "learn" | "quiz";
  contents: BestPracticeContentDraft[];
  questions: QuizQuestionDraft[];
  onBack: () => void;
  onContentClick?: (content: BestPracticeContentDraft) => void;
}

export const CategoryView = ({
  category,
  mode,
  contents,
  questions,
  onBack,
  onContentClick,
}: CategoryViewProps) => {
  const Icon = getCategoryIcon(category.key as "feeding_nutrition");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

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

  // Infinite scroll state (only for learn mode)
  const [items, setItems] = useState<BestPracticeContentDraft[]>(contents);
  // No inline selected now; navigation to dedicated page
  const [page, setPage] = useState(1); // parent may have provided page 0
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  // Read tracking (local only)
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("practice.readIds");
      if (raw) return new Set(JSON.parse(raw));
    } catch {
      // ignore JSON / storage errors
    }
    return new Set();
  });
  const persistRead = (ids: Set<string>) => {
    try {
      localStorage.setItem("practice.readIds", JSON.stringify([...ids]));
    } catch {
      // ignore storage write errors
    }
  };
  const markRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistRead(next);
      return next;
    });
  };
  // Context menu state (kebab menu per card)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((curr) => (curr === id ? null : id));
  };
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest("[data-practice-menu]") &&
        !(e.target as HTMLElement).closest("[data-practice-menu-btn]")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Reset items when category or external contents change
  useEffect(() => {
    setItems(contents);
    setPage(1);
    setHasMore(true);
  }, [contents, category.key]);

  const loadMore = useCallback(() => {
    if (mode !== "learn" || !hasMore || loadingMore) return;
    setLoadingMore(true);
    setLoadError(null);
    fetchPracticesPage(
      page,
      BEST_PRACTICES_PAGE_SIZE,
      category.key as BestPracticeCategoryKey
    )
      .then((res) => {
        setItems((prev) => [
          ...prev,
          ...res.data.filter((n) => !prev.some((p) => p.id === n.id)),
        ]);
        setHasMore(res.hasMore);
        setPage((p) => p + 1);
      })
      .catch((e) => {
        setLoadError(e?.message || "Failed to load more practices");
      })
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, mode, category.key]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const el = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: "600px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Filter content based on search (from locally accumulated items)
  const filteredContents = items.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuestions = questions.filter((question) =>
    question.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto w-full px-3 sm:px-6 lg:px-10 max-w-5xl overflow-x-hidden">
      {/* Simple Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 group hover:cursor-pointer"
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

        {/* Clean Category Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5 sm:mb-6 tracking-tight break-words">
          {category.name}
        </h1>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-6 sm:space-y-8">
        {mode === "learn" &&
          filteredContents.map((content) => (
            <article
              key={content.id}
              onClick={() => {
                onContentClick?.(content);
                markRead(content.id);
                navigate(`/dashboard/best-practices/${content.id}`, {
                  state: {
                    practice: content,
                    originCategory: category.key as BestPracticeCategoryKey,
                    ctx: { category: category.key },
                  },
                });
              }}
              className="relative group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6 md:p-7 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-[1.375rem] leading-snug font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors break-words">
                    {content.title}
                  </h2>

                  {/* Category tags */}
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    {content.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-medium tracking-wide"
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-4 sm:mb-5 leading-relaxed max-w-[72ch] line-clamp-2 text-sm sm:text-base">
                    {content.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {content.steps.length} steps
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {content.benefits.length} benefits
                    </span>

                    <span className="flex items-center gap-1">
                      <svg
                        className={`w-4 h-4 ${
                          readIds.has(content.id)
                            ? "text-green-500"
                            : "text-slate-300"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className={`text-xs ${
                          readIds.has(content.id)
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-400"
                        }`}
                      >
                        {readIds.has(content.id) ? "Read" : "Unread"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Optional: Add a checkmark if this is a completed/read item */}
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-slate-400"
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
              {/* Kebab menu button (bottom-right) */}
              <button
                data-practice-menu-btn
                onClick={(e) => toggleMenu(content.id, e)}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-haspopup="true"
                aria-expanded={openMenuId === content.id}
                aria-label="Practice options"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  />
                </svg>
              </button>
              {openMenuId === content.id && (
                <div
                  data-practice-menu
                  className="absolute bottom-16 right-4 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-20"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                      // Placeholder: trigger edit
                      console.log("Edit practice", content.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  >
                    Edit Practice
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                      // Placeholder: trigger delete
                      console.log("Delete practice", content.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Delete Practice
                  </button>
                </div>
              )}
            </article>
          ))}

        {mode === "quiz" &&
          filteredQuestions.map((question) => (
            <article
              key={question.id}
              className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6 md:p-7 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-[1.375rem] leading-snug font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors break-words">
                    {question.prompt}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === "easy"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : question.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {question.difficulty}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {question.choices.length} choices
                    </span>
                    <span className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${g.dot}`} />
                      Quiz
                    </span>
                  </div>
                </div>

                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-slate-400"
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
            </article>
          ))}

        {/* Empty States */}
        {mode === "learn" &&
          filteredContents.length === 0 &&
          contents.length > 0 && (
            <div className="text-center py-12">
              <div className="text-slate-500 dark:text-slate-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-lg font-medium">No practices found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            </div>
          )}

        {mode === "learn" && contents.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div
              className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${g.block} rounded-xl flex items-center justify-center`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No practices yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              No best practice guides available for{" "}
              {category.name.toLowerCase()}
            </p>
          </div>
        )}

        {mode === "quiz" && questions.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div
              className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${g.block} rounded-xl flex items-center justify-center`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No questions yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              No quiz questions available for {category.name.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Details moved to dedicated route; no inline panel */}

      {/* Infinite Scroll Loader / Error / Skeleton */}
      {mode === "learn" && (
        <div
          ref={loaderRef}
          className="py-10 flex flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400"
        >
          {loadingMore && (
            <div className="w-full max-w-sm space-y-3">
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          )}
          {loadError && (
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                />
              </svg>
              <span>{loadError}</span>
              <button
                onClick={loadMore}
                className="underline text-xs font-medium hover:text-red-700 dark:hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}
          {!loadingMore &&
            !loadError &&
            !hasMore &&
            filteredContents.length > 0 && (
              <span className="text-slate-400">No more practices</span>
            )}
        </div>
      )}
    </div>
  );
};
