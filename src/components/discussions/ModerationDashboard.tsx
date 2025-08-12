import { useState, useCallback } from "react";
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
  getPendingModerationPosts,
  getProcessedModerationHistory,
  getPostData,
  type PostModerationStatus,
  type ModerationAction,
} from "@/data/moderation";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 items per page

  // Get fresh data on each render (refreshKey forces re-evaluation)
  const [pendingModerations, setPendingModerations] = useState(() =>
    getPendingModerationPosts()
  );
  const [moderationHistory, setModerationHistory] = useState(() =>
    getProcessedModerationHistory()
  );

  // Function to refresh data
  const refreshData = useCallback(() => {
    setPendingModerations(getPendingModerationPosts());
    setModerationHistory(getProcessedModerationHistory());
  }, []);

  const handleQuickAction = async (
    postId: string,
    action: "retained" | "deleted" | "warned"
  ) => {
    console.log(`Quick action: ${action} for post ${postId}`);

    // Refresh data to show updated state
    refreshData();

    // Reset to first page of pending tab to see updated results
    setActiveTab("pending");
    setCurrentPage(1);

    // Show success message
    alert(`Post ${action} successfully!`);

    // In real implementation, you would:
    // 1. Call API to update moderation status
    // 2. Update local state
    // 3. Show success notification
    // 4. Remove from pending list
  };

  const filteredPending = pendingModerations.filter((mod) => {
    if (searchQuery) {
      // Get post data to access title and author
      const postData = getPostData(mod.postId);
      const mainReason = mod.reports[0]?.reason || "";

      return (
        postData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        postData.author.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        mainReason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const filteredHistory = moderationHistory.filter((mod) => {
    // Apply search filter
    let matchesSearch = true;
    if (searchQuery) {
      const postData = getPostData(mod.postId);
      matchesSearch =
        postData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        postData.author.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        mod.action.decision.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(
          mod.action.justification &&
            mod.action.justification
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
    }

    // Apply time filter
    let matchesTime = true;
    if (timeFilter !== "all") {
      const actionDate = new Date(mod.action.timestamp);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (timeFilter) {
        case "24h":
          matchesTime = daysDiff <= 1;
          break;
        case "7days":
          matchesTime = daysDiff <= 7;
          break;
        case "30days":
          matchesTime = daysDiff <= 30;
          break;
      }
    }

    return matchesSearch && matchesTime;
  });

  // Pagination calculations
  const currentData =
    activeTab === "pending" ? filteredPending : filteredHistory;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = currentData.slice(startIndex, endIndex);

  // Reset page when changing tabs or filters
  const handleTabChange = (tab: "pending" | "history") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Back Button & Title */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDiscussions}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl px-4 py-2 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Discussions</span>
              </Button>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Moderation Center
                    </h1>
                    <p className="text-sm text-gray-500">
                      Manage community content
                    </p>
                  </div>
                </div>

                {pendingModerations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <Badge
                      variant="destructive"
                      className="text-sm font-semibold shadow-sm"
                    >
                      {pendingModerations.length} Pending
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
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100/60 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => handleTabChange("pending")}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "pending"
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Pending</span>
                  {pendingModerations.length > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {pendingModerations.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleTabChange("history")}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "history"
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search and Filters */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input
                placeholder="Search posts, users, or moderators..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-3 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 rounded-xl shadow-sm focus:shadow-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <select
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 min-w-36"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Pending Moderation
                </h2>
                <p className="text-gray-600">
                  Review reported content and take appropriate action
                </p>
              </div>
              {filteredPending.length > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {filteredPending.length} post
                    {filteredPending.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "pending" && totalPages > 1
                      ? `Showing ${startIndex + 1}-${Math.min(
                          endIndex,
                          filteredPending.length
                        )} of ${filteredPending.length}`
                      : "awaiting review"}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            {filteredPending.length === 0 ? (
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
                  {(activeTab === "pending"
                    ? currentPageData
                    : currentPageData
                  ).map((modStatus) => (
                    <div
                      key={modStatus.postId}
                      className="bg-white/70 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <ModerationCard
                        moderationStatus={modStatus}
                        onViewDetails={onViewPostDetails}
                        onQuickAction={handleQuickAction}
                        onActionComplete={refreshData}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 ${
                              page === currentPage
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "hover:bg-orange-50"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Moderation History
                </h2>
                <p className="text-gray-600">
                  Track completed moderation actions and decisions
                </p>
              </div>
              {filteredHistory.length > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {filteredHistory.length} action
                    {filteredHistory.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "history" && totalPages > 1
                      ? `Showing ${startIndex + 1}-${Math.min(
                          endIndex,
                          filteredHistory.length
                        )} of ${filteredHistory.length}`
                      : "completed"}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            {filteredHistory.length === 0 ? (
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
              <div className="space-y-6">
                <div className="grid gap-4">
                  {currentPageData.map((modStatus) => (
                    <div
                      key={`${modStatus.postId}-${
                        modStatus.action?.id || "no-action"
                      }`}
                      className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <ModerationHistoryCard
                        moderationStatus={
                          modStatus as PostModerationStatus & {
                            action: ModerationAction;
                          }
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 ${
                              page === currentPage
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "hover:bg-orange-50"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
