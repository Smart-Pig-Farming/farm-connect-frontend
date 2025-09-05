import { useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModerationCard } from "./ModerationCard";
import { ModerationHistoryCard } from "./ModerationHistoryCard";
import {
  type PostModerationStatus,
  type ModerationAction,
  type ModerationReport,
} from "@/data/moderation";
import {
  useGetPendingModerationQuery,
  useGetModerationHistoryQuery,
  useDecideModerationMutation,
} from "@/store/api/discussionsApi";
import type {
  ModerationPendingItem,
  ModerationHistoryItem,
  Post,
} from "@/store/api/discussionsApi";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ModerationDashboardProps {
  onBackToDiscussions: () => void;
  onViewPostDetails: (postId: string) => void;
}

export function ModerationDashboard({
  onBackToDiscussions,
  onViewPostDetails,
}: ModerationDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("7days");
  const [decisionFilter, setDecisionFilter] = useState<
    "all" | "retained" | "deleted" | "warned"
  >("all");

  // Server-side pagination state (separate per tab)
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5); // items per page selector

  // Compute time range for history query
  const fromIso = useMemo(() => {
    if (timeFilter === "all") return undefined;
    const now = new Date();
    const d = new Date(now);
    switch (timeFilter) {
      case "24h":
        d.setDate(now.getDate() - 1);
        break;
      case "7days":
        d.setDate(now.getDate() - 7);
        break;
      case "30days":
        d.setDate(now.getDate() - 30);
        break;
      case "90days":
        d.setDate(now.getDate() - 90);
        break;
    }
    return d.toISOString();
  }, [timeFilter]);

  // Load from API with server-side pagination and filters
  const { data: pendingData, refetch: refetchPending } =
    useGetPendingModerationQuery({
      search: searchQuery || undefined,
      page: pendingPage,
      limit: pageSize,
    });
  const { data: historyData, refetch: refetchHistory } =
    useGetModerationHistoryQuery({
      from: fromIso,
      search: searchQuery || undefined,
      decision:
        decisionFilter === "all"
          ? undefined
          : (decisionFilter as "retained" | "deleted" | "warned"),
      page: historyPage,
      limit: pageSize,
    });
  const [decideModeration] = useDecideModerationMutation();
  // Metrics removed

  const ensureReason = (r: string): ModerationReport["reason"] => {
    const allowed: readonly ModerationReport["reason"][] = [
      "inappropriate",
      "spam",
      "fraudulent",
      "misinformation",
      "technical",
      "other",
    ] as const;
    return (allowed as readonly string[]).includes(r)
      ? (r as ModerationReport["reason"])
      : "other";
  };

  const pendingModerations: PostModerationStatus[] = useMemo(() => {
    return (pendingData?.data ?? []).map((item: ModerationPendingItem) => ({
      postId: item.postId,
      status: "pending",
      reportCount: item.reportCount,
      mostCommonReason: item.mostCommonReason ?? "",
      reports: (item.reports ?? []).map((r, idx: number) => {
        const reporter = (
          r as unknown as {
            reporter?: { firstname?: string; lastname?: string };
          }
        )?.reporter;
        const fname = reporter?.firstname ?? "";
        const lname = reporter?.lastname ?? "";
        const repName = [fname, lname].filter(Boolean).join(" ").trim();
        const reporterName =
          r.reporterName && r.reporterName.trim().length > 0
            ? r.reporterName
            : repName || "Anonymous";
        return {
          id: r.id ?? `${item.postId}-r${idx}`,
          postId: item.postId,
          reporterId: String(r.reporterId ?? ""),
          reporterName,
          reason: ensureReason(String(r.reason ?? "other")),
          details: r.details ?? undefined,
          timestamp: new Date(r.createdAt ?? Date.now()),
        };
      }),
    }));
  }, [pendingData]);

  const moderationHistory: Array<
    PostModerationStatus & { action: ModerationAction }
  > = useMemo(() => {
    return (historyData?.data ?? []).map(
      (h: ModerationHistoryItem, idx: number) => {
        const decision = (h.decision ??
          "retained") as ModerationAction["decision"];
        const decidedAt = h.decidedAt ?? new Date().toISOString();
        const action: ModerationAction = {
          id: `${h.postId}-${idx}`,
          postId: h.postId,
          moderatorId: String(h.moderator?.id ?? ""),
          moderatorName: h.moderator?.name ?? "Moderator",
          decision,
          justification: h.justification ?? undefined,
          timestamp: new Date(decidedAt),
        };
        return {
          postId: h.postId,
          status: decision,
          reportCount: h.count ?? 0,
          mostCommonReason: "",
          reports: [],
          action,
        };
      }
    );
  }, [historyData]);

  // Map: postId -> partial post (from pending payload) for richer previews
  const pendingPostById = useMemo(() => {
    const map = new Map<string, Partial<Post>>();
    (pendingData?.data ?? []).forEach((item) => {
      if ((item as ModerationPendingItem).post) {
        map.set(
          (item as ModerationPendingItem).postId,
          (item as ModerationPendingItem).post as Partial<Post>
        );
      }
    });
    return map;
  }, [pendingData]);

  const historyPostById = useMemo(() => {
    const map = new Map<string, Partial<Post>>();
    (historyData?.data ?? []).forEach((item) => {
      if ((item as ModerationHistoryItem).post) {
        map.set(
          (item as ModerationHistoryItem).postId,
          (item as ModerationHistoryItem).post as Partial<Post>
        );
      }
    });
    return map;
  }, [historyData]);

  const buildPostOverride = (p?: Partial<Post>) => {
    const firstname = p?.author?.firstname ?? "";
    const lastname = p?.author?.lastname ?? "";
    const name =
      [firstname, lastname].filter(Boolean).join(" ").trim() || "User";
    const location = p?.author?.location ?? "";

    const media = (p?.media ?? []) as Post["media"];
    const imagesFromMedia: string[] = media
      .filter((m) => m.media_type === "image")
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((m) => m.url);
    const videoFromMedia: string | null =
      media.find((m) => m.media_type === "video")?.url ?? null;

    const imagesFallbackArr = (p?.images ?? []) as Post["images"];
    const imagesFallback: string[] = imagesFallbackArr
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((im) => im.url);

    const images =
      imagesFromMedia.length > 0 ? imagesFromMedia : imagesFallback;
    const video = videoFromMedia ?? (p?.video ? p.video.url : null);

    return {
      title: p?.title ?? "",
      author: { name, location },
      content: p?.content ?? "",
      images,
      video,
      timestamp: new Date(p?.createdAt ?? Date.now()),
    } as const;
  };

  // Refresh using queries
  const refreshData = useCallback(() => {
    void refetchPending();
    void refetchHistory();
  }, [refetchPending, refetchHistory]);

  // WebSocket: auto-refresh moderation lists on server events
  useWebSocket(
    {
      onModerationReport: () => {
        // New report arrived; refresh pending queue
        refetchPending();
      },
      // We'll wire decision event in the ws hook and handle it here
      onModerationDecision: (data) => {
        console.log("🔔 Received moderation decision:", data);

        const decisionText =
          {
            retained: "✅ Content retained",
            deleted: "🗑️ Content deleted",
            warned: "⚠️ User warned",
          }[data.decision] || "📝 Decision applied";

        const message = data.justification
          ? `${decisionText}: ${data.justification}`
          : decisionText;

        toast.success(message, {
          duration: 4000,
        });
        refreshData();
      },
    },
    { autoConnect: true }
  );

  const handleQuickAction = async (
    postId: string,
    action: "retained" | "deleted" | "warned",
    justification?: string
  ) => {
    await toast.promise(
      decideModeration({ postId, decision: action, justification }).unwrap(),
      {
        loading: "Applying decision…",
        success: () => `Decision applied: ${action}`,
        error: "Failed to apply decision",
      }
    );
    refreshData();
    setActiveTab("pending");
    setPendingPage(1);
  };

  // Pagination meta from server
  const pendingTotal =
    pendingData?.pagination?.total ?? pendingModerations.length;
  const pendingTotalPages =
    (pendingData?.pagination?.totalPages ??
      Math.ceil(pendingTotal / pageSize)) ||
    1;
  const historyTotal =
    historyData?.pagination?.total ?? moderationHistory.length;
  const historyTotalPages =
    (historyData?.pagination?.totalPages ??
      Math.ceil(historyTotal / pageSize)) ||
    1;
  const pendingStart = (pendingPage - 1) * pageSize + 1;
  const historyStart = (historyPage - 1) * pageSize + 1;

  // Reset page when changing tabs or filters
  const handleTabChange = (tab: "pending" | "history") => {
    setActiveTab(tab);
    if (tab === "pending") setPendingPage(1);
    if (tab === "history") setHistoryPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPendingPage(1);
    setHistoryPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setHistoryPage(1);
  };

  const handleDecisionFilterChange = (
    value: "all" | "retained" | "deleted" | "warned"
  ) => {
    setDecisionFilter(value);
    setHistoryPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPendingPage(1);
    setHistoryPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 overflow-x-hidden">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header container wraps on small screens to avoid horizontal overflow */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
            {/* Back Button & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full">
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToDiscussions}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl px-4 py-2 transition-all duration-200 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Discussions</span>
                </Button>
              </div>

              <div className="flex items-center gap-4 flex-wrap min-w-0 w-full sm:w-auto">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight break-words">
                      Moderation Center
                    </h1>
                    <p className="text-sm text-gray-500 break-words">
                      Manage community content
                    </p>
                  </div>
                </div>

                {pendingTotal > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <Badge
                      variant="destructive"
                      className="text-sm font-semibold shadow-sm"
                    >
                      {pendingTotal} Pending
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex bg-gray-100/60 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => handleTabChange("pending")}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:cursor-pointer ${
                  activeTab === "pending"
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Pending</span>
                  {pendingTotal > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {pendingTotal}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleTabChange("history")}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                History
              </button>
            </div>
            {/* Metrics summary removed */}
          </div>
        </div>
      </div>

      {/* Modern Search and Filters */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="w-full lg:flex-1 lg:min-w-[260px] min-w-0 relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input
                placeholder="Search posts, users, or moderators..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 rounded-xl shadow-sm focus:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200 min-w-0"
              />
            </div>

            {/* Filter Controls */}
            {/* On small screens, especially in History tab, stack controls vertically to avoid side-by-side crowding */}
            <div
              className={`flex gap-3 w-full lg:w-auto items-stretch md:items-center ${
                activeTab === "history"
                  ? "flex-col md:flex-row"
                  : "flex-wrap md:flex-nowrap"
              }`}
            >
              <select
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto md:min-w-36 shrink-0"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>

              {/* Decision Filter (History only) - responsive */}
              {activeTab === "history" && (
                <>
                  {/* Segmented control for md+ screens */}
                  <div className="hidden md:flex bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl h-12 p-1 shadow-sm md:w-auto">
                    {[
                      { key: "all", label: "All" },
                      { key: "retained", label: "Retained" },
                      { key: "deleted", label: "Deleted" },
                      { key: "warned", label: "Warned" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          handleDecisionFilterChange(
                            opt.key as "all" | "retained" | "deleted" | "warned"
                          )
                        }
                        className={`px-3 sm:px-4 rounded-lg text-sm font-medium transition-colors duration-200 hover:cursor-pointer ${
                          decisionFilter === opt.key
                            ? "bg-orange-600 text-white"
                            : "text-gray-700 hover:bg-gray-100/70"
                        }`}
                        aria-pressed={decisionFilter === opt.key}
                        aria-label={`Filter by ${opt.label.toLowerCase()} decision`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Compact select for small screens */}
                  <select
                    className="md:hidden bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto md:min-w-36 shrink-0"
                    value={decisionFilter}
                    onChange={(e) =>
                      handleDecisionFilterChange(
                        e.target.value as
                          | "all"
                          | "retained"
                          | "deleted"
                          | "warned"
                      )
                    }
                    aria-label="Decision filter"
                  >
                    <option value="all">All Decisions</option>
                    <option value="retained">Retained</option>
                    <option value="deleted">Deleted</option>
                    <option value="warned">Warned</option>
                  </select>
                </>
              )}

              {/* Page size selector */}
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto md:min-w-28 shrink-0"
                aria-label="Items per page"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "pending" ? (
          <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 break-words leading-tight">
                  Pending Moderation
                </h2>
                <p className="text-gray-600 break-words">
                  Review reported content and take appropriate action
                </p>
              </div>
              {pendingModerations.length > 0 && (
                <div className="text-right ml-auto">
                  <p className="text-sm font-medium text-gray-900">
                    {pendingTotal} post
                    {pendingTotal !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "pending" && pendingTotalPages > 1
                      ? `Showing ${pendingStart}-${Math.min(
                          pendingStart + (pendingModerations?.length ?? 0) - 1,
                          pendingTotal
                        )} of ${pendingTotal}`
                      : "awaiting review"}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            {pendingModerations.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl inline-flex mb-6">
                    <Shield className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {searchQuery ? "No matching reports" : "All clear!"}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {searchQuery
                      ? "No reports match your current search criteria. Try adjusting your filters or search terms."
                      : "Great job! All reported content has been reviewed and resolved."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {pendingModerations.map((modStatus) => (
                    <div
                      key={modStatus.postId}
                      className="bg-white/70 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 break-words"
                    >
                      <ModerationCard
                        moderationStatus={modStatus}
                        onViewDetails={onViewPostDetails}
                        onQuickAction={handleQuickAction}
                        onActionComplete={refreshData}
                        postOverride={buildPostOverride(
                          pendingPostById.get(modStatus.postId)
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pendingTotalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage(pendingPage - 1)}
                      disabled={pendingPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex flex-wrap items-center gap-1 max-w-full">
                      {Array.from(
                        { length: pendingTotalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={page === pendingPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPendingPage(page)}
                          className={`w-8 h-8 ${
                            page === pendingPage
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "hover:bg-orange-50"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage(pendingPage + 1)}
                      disabled={pendingPage === pendingTotalPages}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 break-words leading-tight">
                  Moderation History
                </h2>
                <p className="text-gray-600 break-words">
                  Track completed moderation actions and decisions
                </p>
              </div>
              {moderationHistory.length > 0 && (
                <div className="text-right ml-auto">
                  <p className="text-sm font-medium text-gray-900">
                    {historyTotal} action
                    {historyTotal !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "history" && historyTotalPages > 1
                      ? `Showing ${historyStart}-${Math.min(
                          historyStart + (moderationHistory?.length ?? 0) - 1,
                          historyTotal
                        )} of ${historyTotal}`
                      : "completed"}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            {moderationHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl inline-flex mb-6">
                    <Shield className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {searchQuery ? "No matching history" : "No history yet"}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {searchQuery
                      ? "No moderation history matches your current search criteria."
                      : "Moderation actions and decisions will appear here once you start reviewing content."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 overflow-x-hidden">
                <div className="grid gap-4 max-w-full">
                  {moderationHistory.map((modStatus) => (
                    <div
                      key={`${modStatus.postId}-${
                        modStatus.action?.id || "no-action"
                      }`}
                      className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 break-words w-full max-w-full overflow-hidden"
                    >
                      <ModerationHistoryCard
                        moderationStatus={
                          modStatus as PostModerationStatus & {
                            action: ModerationAction;
                          }
                        }
                        postOverride={buildPostOverride(
                          historyPostById.get(modStatus.postId)
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {historyTotalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(historyPage - 1)}
                      disabled={historyPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex flex-wrap items-center gap-1 max-w-full">
                      {Array.from(
                        { length: historyTotalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={page === historyPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHistoryPage(page)}
                          className={`w-8 h-8 ${
                            page === historyPage
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "hover:bg-orange-50"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(historyPage + 1)}
                      disabled={historyPage === historyTotalPages}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
