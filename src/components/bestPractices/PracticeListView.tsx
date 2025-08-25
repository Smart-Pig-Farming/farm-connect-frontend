import { useState, useEffect, useRef, useCallback } from "react";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
} from "@/types/bestPractices";
import { getCategoryIcon } from "./iconMap";
import { useNavigate } from "react-router-dom";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";
import ClipLoader from "react-spinners/ClipLoader";
import {
  Search,
  Clock,
  Star,
  Blocks,
  Eye,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Lightbulb,
  CheckCircle,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface PracticeListViewProps {
  category: BestPracticeCategory;
  contents: BestPracticeContentDraft[];
  onBack: () => void;
  onContentClick?: (content: BestPracticeContentDraft) => void;
  onEdit?: (content: BestPracticeContentDraft) => void;
  onDelete?: (content: BestPracticeContentDraft) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const PracticeListView = ({
  category,
  contents,
  onBack,
  onContentClick,
  onEdit,
  onDelete,
  onLoadMore,
  hasMore,
  loadingMore,
}: PracticeListViewProps) => {
  const Icon = getCategoryIcon(category.key as "feeding_nutrition");
  const { hasPermission } = usePermissions();

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

  // Items managed externally; local copy for search filtering
  const [items, setItems] = useState<BestPracticeContentDraft[]>(contents);
  // (optional) could surface load errors from parent later
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Read tracking state
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(`farm-connect-read-${category.key}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<BestPracticeContentDraft | null>(null);

  // Mark content as read
  const markRead = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        localStorage.setItem(
          `farm-connect-read-${category.key}`,
          JSON.stringify([...newSet])
        );
        return newSet;
      });
    },
    [category.key]
  );

  // Delete confirmation handlers
  const handleDeleteClick = useCallback((content: BestPracticeContentDraft) => {
    setItemToDelete(content);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, [itemToDelete, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // Reset items when category or external contents change
  useEffect(() => {
    setItems(contents);
  }, [contents, category.key]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    onLoadMore?.();
  }, [onLoadMore, loadingMore, hasMore]);

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

  // Filter content based on search only
  const filteredContents = items.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get category tag colors
  const getCategoryTagColor = (categoryKey: BestPracticeCategoryKey) => {
    switch (categoryKey) {
      case "feeding_nutrition":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50";
      case "disease_control":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/50";
      case "growth_weight":
        return "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50";
      case "environment_management":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50";
      case "breeding_insemination":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50";
      case "farrowing_management":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700/50";
      case "record_management":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50";
      case "marketing_finance":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50";
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:cursor-pointer mb-6 transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-200">
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200"
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
          </div>
          <span className="font-medium">Back to Categories</span>
        </button>

        {/* Simple Search Bar */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6 mb-8">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className={`h-5 w-5 transition-colors duration-200 ${
                  g.subtle
                } group-focus-within:${g.block.replace("text-", "text-")}`}
              />
            </div>
            <input
              type="text"
              placeholder="Search practices, tips, and guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 ${
                g.ring
              } focus:${g.ring.replace(
                "ring-",
                "border-"
              )} backdrop-blur-sm transition-all duration-200`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:cursor-pointer"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-6">
        {filteredContents.map((content, index) => {
          const estimatedReadTime = Math.max(
            2,
            Math.ceil(content.steps.length * 1.5)
          );
          const isRead = readIds.has(content.id);

          return (
            <article
              key={content.id}
              onClick={() => {
                markRead(content.id);
                onContentClick?.(content);
                navigate(`/dashboard/best-practices/${content.id}`, {
                  state: { practice: content },
                });
              }}
              className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative p-6 lg:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Header with Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.block} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-lg text-xs">
                          <Clock className="w-3 h-3" />
                          {estimatedReadTime} min read
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                      {content.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2 text-sm lg:text-base">
                      {content.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${getCategoryTagColor(
                            cat
                          )}`}
                        >
                          {cat
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      ))}
                      {content.categories.length > 3 && (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 text-xs font-medium">
                          +{content.categories.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Blocks className="w-4 h-4" />
                        <span>
                          {"stepsCount" in content &&
                          typeof (content as { stepsCount?: number })
                            .stepsCount === "number"
                            ? (content as { stepsCount?: number }).stepsCount
                            : content.steps.length}{" "}
                          steps
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>
                          {"benefitsCount" in content &&
                          typeof (content as { benefitsCount?: number })
                            .benefitsCount === "number"
                            ? (content as { benefitsCount?: number })
                                .benefitsCount
                            : content.benefits.length}{" "}
                          benefits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Read Status & Action Buttons - Bottom Right */}
                  <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                    {/* Edit and Delete Action Buttons - Only show for users with MANAGE:BEST_PRACTICES permission */}
                    {hasPermission("MANAGE:BEST_PRACTICES") &&
                      (onEdit || onDelete) && (
                        <div className="flex gap-2">
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(content);
                              }}
                              className="group/btn flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 backdrop-blur-sm hover:cursor-pointer"
                              aria-label="Edit practice"
                              title="Edit this practice"
                            >
                              <Edit3 className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors duration-200" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(content);
                              }}
                              className="group/btn flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 backdrop-blur-sm hover:cursor-pointer"
                              aria-label="Delete practice"
                              title="Delete this practice"
                            >
                              <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover/btn:text-red-600 dark:group-hover/btn:text-red-400 transition-colors duration-200" />
                            </button>
                          )}
                        </div>
                      )}

                    {/* Professional Read Status Indicator */}
                    <div
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                        isRead
                          ? "bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50"
                          : "bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                    >
                      {/* Status Dot */}
                      <div
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          isRead
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                      {/* Status Text */}
                      <span
                        className={`text-xs font-medium transition-colors duration-300 ${
                          isRead
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {isRead ? "Read" : "Unread"}
                      </span>
                      {/* Optional subtle icon */}
                      {isRead && (
                        <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 via-emerald-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(45deg, transparent 49%, rgba(249, 115, 22, 0.1) 50%, rgba(16, 185, 129, 0.1) 51%, transparent 52%)",
                }}
              />
            </article>
          );
        })}

        {/* Enhanced Empty States */}
        {filteredContents.length === 0 && contents.length > 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {/* Simple Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-500 dark:text-slate-400" />
              </div>

              {/* Clean Typography */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                No practices found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                We couldn't find any practices matching "{searchTerm}". Try
                different keywords or clear your search.
              </p>

              {/* Simple Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSearchTerm("")}
                  className={`px-6 py-2.5 ${g.subtle} bg-slate-50 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                >
                  Clear Search
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        )}

        {contents.length === 0 && (
          <div className="text-center py-24">
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-2xl p-20 max-w-3xl mx-auto overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${g.block
                    .replace("to-", "to-")
                    .replace(
                      "from-",
                      "from-"
                    )}/10 rounded-full blur-3xl animate-pulse`}
                />
                <div
                  className={`absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br ${g.block
                    .replace("to-", "to-")
                    .replace(
                      "from-",
                      "from-"
                    )}/10 rounded-full blur-3xl animate-pulse`}
                  style={{ animationDelay: "2s" }}
                />
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-300/5 to-purple-300/5 rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "3s" }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon Container with Animation */}
                <div className="relative mb-10">
                  <div
                    className={`w-32 h-32 mx-auto bg-gradient-to-br ${g.block} rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="w-14 h-14 text-white" />
                  </div>
                  {/* Floating elements */}
                  <div
                    className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 animate-bounce flex items-center justify-center"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div
                    className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-70 animate-bounce flex items-center justify-center"
                    style={{ animationDelay: "1s" }}
                  >
                    <Lightbulb className="w-3 h-3 text-white" />
                  </div>
                  <div
                    className="absolute top-2 -left-6 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 animate-bounce"
                    style={{ animationDelay: "1.5s" }}
                  />
                </div>

                {/* Title and Description */}
                <div className="space-y-8 mb-12">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      Coming Soon
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <BookOpen className={`w-5 h-5 ${g.subtle}`} />
                      <span className={`font-semibold ${g.subtle}`}>
                        {category.name} Practices
                      </span>
                    </div>
                  </div>

                  <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    We're crafting amazing{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-300">
                      {category.name.toLowerCase()}
                    </span>{" "}
                    practices just for you. Our experts are working hard to
                    bring you the best guides, tips, and insights.
                  </p>

                  {/* Feature Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center space-y-3 p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Expert Guides
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Step-by-step tutorials
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center space-y-3 p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Best Practices
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Industry standards
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center space-y-3 p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Advanced Tips
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Pro techniques
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button
                    onClick={onBack}
                    className={`group px-10 py-5 bg-gradient-to-r ${g.button} text-white rounded-2xl font-semibold ${g.buttonHover} transition-all duration-300 transform hover:scale-105 flex items-center gap-3`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Explore Other Categories
                  </button>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Stay tuned for updates!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Infinite Scroll Loader */}
      <div
        ref={loaderRef}
        className="py-12 flex flex-col items-center justify-center"
      >
        {loadingMore && (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              {/* ClipLoader Spinner */}
              <ClipLoader
                color={
                  category.key === "feeding_nutrition"
                    ? "#10b981" // emerald-500
                    : category.key === "disease_control"
                    ? "#ef4444" // red-500
                    : category.key === "growth_weight"
                    ? "#14b8a6" // teal-500
                    : category.key === "environment_management"
                    ? "#6366f1" // indigo-500
                    : category.key === "breeding_insemination"
                    ? "#a855f7" // purple-500
                    : category.key === "farrowing_management"
                    ? "#ec4899" // pink-500
                    : category.key === "record_management"
                    ? "#3b82f6" // blue-500
                    : category.key === "marketing_finance"
                    ? "#f97316" // orange-500
                    : "#f97316" // default orange
                }
                size={20}
                loading={true}
              />

              {/* Loading Text */}
              <p className={`text-sm ${g.subtle}`}>Loading more practices...</p>
            </div>
          </div>
        )}

        {!loadingMore && !hasMore && filteredContents.length > 0 && (
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto">
              {/* Simple Success Icon */}
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Success Message */}
              <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                All Caught Up!
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                You've viewed all {filteredContents.length} available practices.
              </p>

              {/* Simple Action */}
              <button
                onClick={onBack}
                className={`px-6 py-2.5 ${g.subtle} bg-slate-50 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors hover:cursor-pointer`}
              >
                Explore More Categories
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Custom CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Delete Practice
                </h3>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors hover:cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  "{itemToDelete.title}"
                </span>
                ?
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. The practice and all its
                associated data will be permanently removed.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-b-lg">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 flex items-center gap-2 hover:cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
