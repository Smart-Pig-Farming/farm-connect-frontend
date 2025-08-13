import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Archive,
  BarChart3,
  Shield,
  Users,
  TrendingUp,
  Camera,
  FileText,
} from "lucide-react";
import {
  useGetPendingReportsQuery,
  useGetModerationHistoryQuery,
  useGetModerationMetricsQuery,
  useMakeDecisionMutation,
  useMakeBulkDecisionMutation,
  formatModerationReason,
  formatDecision,
  formatDuration,
} from "@/store/api/moderationApi";
import type {
  PendingModerationItem,
  EnhancedModerationHistoryItem,
  ModerationFilters,
  ModerationMetrics,
  ModerationHistoryResponse,
} from "@/types/moderation";
import { toast } from "sonner";

interface ModerationDashboardProps {
  className?: string;
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  className = "",
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<
    "pending" | "history" | "analytics"
  >("pending");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(
    new Set()
  );
  const [filters, setFilters] = useState<ModerationFilters>({
    search: "",
    timeRange: "7days",
    page: 1,
    limit: 10,
  });
  const [bulkAction, setBulkAction] = useState<
    "retained" | "deleted" | "warned"
  >("retained");
  const [bulkJustification, setBulkJustification] = useState("");
  const [showSnapshots, setShowSnapshots] = useState(false);

  // API hooks
  const {
    data: pendingReports,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetPendingReportsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    timeRange: filters.timeRange,
  });

  const { data: moderationHistory, isLoading: historyLoading } =
    useGetModerationHistoryQuery({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      timeRange: filters.timeRange,
    });

  const { data: metrics, isLoading: metricsLoading } =
    useGetModerationMetricsQuery({
      timeRange: filters.timeRange === "all" ? "90days" : filters.timeRange,
    });

  const [makeDecision] = useMakeDecisionMutation();
  const [makeBulkDecision] = useMakeBulkDecisionMutation();

  // Event handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<ModerationFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    []
  );

  const handleSelectReport = useCallback(
    (reportId: string, selected: boolean) => {
      setSelectedReports((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(reportId);
        } else {
          newSet.delete(reportId);
        }
        return newSet;
      });
    },
    []
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && pendingReports?.reports) {
        setSelectedReports(new Set(pendingReports.reports.map((r) => r.id)));
      } else {
        setSelectedReports(new Set());
      }
    },
    [pendingReports?.reports]
  );

  const handleQuickAction = useCallback(
    async (
      reportId: string,
      decision: "retained" | "deleted" | "warned",
      justification: string = "Quick moderation action"
    ) => {
      try {
        await makeDecision({ reportId, decision, justification }).unwrap();
        toast.success(`Content ${formatDecision(decision).toLowerCase()}`);
        refetchPending();
      } catch (error) {
        toast.error("Failed to process moderation decision");
        console.error("Moderation error:", error);
      }
    },
    [makeDecision, refetchPending]
  );

  const handleBulkAction = useCallback(async () => {
    if (selectedReports.size === 0 || !bulkJustification.trim()) {
      toast.error("Please select reports and provide justification");
      return;
    }

    try {
      const result = await makeBulkDecision({
        postIds: Array.from(selectedReports),
        decision: bulkAction,
        justification: bulkJustification,
      }).unwrap();

      toast.success(`Processed ${result.processed} reports successfully`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} reports failed to process`);
      }

      setSelectedReports(new Set());
      setBulkJustification("");
      refetchPending();
    } catch (error) {
      toast.error("Failed to process bulk moderation");
      console.error("Bulk moderation error:", error);
    }
  }, [
    selectedReports,
    bulkAction,
    bulkJustification,
    makeBulkDecision,
    refetchPending,
  ]);

  // Computed values
  const selectedCount = selectedReports.size;
  const isAllSelected =
    pendingReports?.reports &&
    selectedReports.size === pendingReports.reports.length;

  // Metrics summary cards
  const MetricsCards = useMemo(() => {
    if (metricsLoading || !metrics) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Reports
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.pendingCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Resolved (7d)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.decisionsLast7d}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatDuration(metrics.medianTimeToDecisionSec)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Report Accuracy
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(metrics.reportAccuracy * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }, [metrics, metricsLoading]);

  // Pending reports list
  const PendingReportsList = useMemo(() => {
    if (pendingLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!pendingReports?.reports.length) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Pending Reports
            </h3>
            <p className="text-gray-500">
              All reports have been reviewed. Great job!
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {pendingReports.reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            isSelected={selectedReports.has(report.id)}
            onSelect={(selected) => handleSelectReport(report.id, selected)}
            onQuickAction={handleQuickAction}
            showSnapshot={showSnapshots}
          />
        ))}
      </div>
    );
  }, [
    pendingLoading,
    pendingReports,
    selectedReports,
    handleSelectReport,
    handleQuickAction,
    showSnapshots,
  ]);

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Moderation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage reported content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPending()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {MetricsCards}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.timeRange || "7days"}
              onValueChange={(value: string) =>
                handleFilterChange({
                  timeRange: value as
                    | "24h"
                    | "7days"
                    | "30days"
                    | "90days"
                    | "all",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSnapshots"
                checked={showSnapshots}
                onChange={(e) => setShowSnapshots(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showSnapshots" className="text-sm font-medium">
                Show Snapshots
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="selectAll" className="text-sm font-medium">
                Select All
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">
                  {selectedCount} report{selectedCount !== 1 ? "s" : ""}{" "}
                  selected
                </span>
                <Select
                  value={bulkAction}
                  onValueChange={(value: string) =>
                    setBulkAction(value as "retained" | "deleted" | "warned")
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retained">Retain Content</SelectItem>
                    <SelectItem value="deleted">Delete Content</SelectItem>
                    <SelectItem value="warned">Warn User</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Justification (required)"
                  value={bulkJustification}
                  onChange={(e) => setBulkJustification(e.target.value)}
                  className="min-w-64"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReports(new Set())}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkJustification.trim()}
                >
                  Apply to {selectedCount} Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "pending" | "history" | "analytics")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending Reports
            {metrics?.pendingCount && (
              <Badge variant="secondary" className="ml-1">
                {metrics.pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Moderation History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {PendingReportsList}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ModerationHistoryList
            history={moderationHistory}
            loading={historyLoading}
            showSnapshots={showSnapshots}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ModerationAnalytics
            metrics={metrics}
            loading={metricsLoading}
            timeRange={filters.timeRange || "7days"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Individual Report Card Component
interface ReportCardProps {
  report: PendingModerationItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onQuickAction: (
    reportId: string,
    action: "retained" | "deleted" | "warned",
    justification?: string
  ) => void;
  showSnapshot: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isSelected,
  onSelect,
  onQuickAction,
  showSnapshot,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [justification, setJustification] = useState("");

  const handleQuickAction = (action: "retained" | "deleted" | "warned") => {
    if (!justification.trim()) {
      toast.error("Please provide justification");
      return;
    }
    onQuickAction(report.id, action, justification);
    setJustification("");
    setShowDetails(false);
  };

  return (
    <Card
      className={`transition-all ${isSelected ? "ring-2 ring-blue-500" : ""}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">
                  {formatModerationReason(report.reason)}
                </Badge>
                <Badge variant="outline">
                  {report.report_count} report
                  {report.report_count !== 1 ? "s" : ""}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {report.post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                {report.post.content}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  By: {report.post.author?.firstname}{" "}
                  {report.post.author?.lastname}
                </span>
                <span>
                  Reported by: {report.reporter.firstname}{" "}
                  {report.reporter.lastname}
                </span>
                {report.post.media && report.post.media.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {report.post.media.length} media
                  </span>
                )}
              </div>
              {report.details && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Details:</strong> {report.details}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? "Hide" : "Review"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="border-t">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Moderation Decision & Justification
              </label>
              <textarea
                placeholder="Explain your decision..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => handleQuickAction("retained")}
                disabled={!justification.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Retain Content
              </Button>
              <Button
                variant="outline"
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                onClick={() => handleQuickAction("warned")}
                disabled={!justification.trim()}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Warn User
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleQuickAction("deleted")}
                disabled={!justification.trim()}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Delete Content
              </Button>
            </div>

            {showSnapshot && report.post_snapshot && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Content Snapshot
                </h4>
                <div className="text-sm text-blue-800">
                  <p>
                    <strong>Title:</strong> {report.post_snapshot.title}
                  </p>
                  <p className="mt-1 line-clamp-3">
                    <strong>Content:</strong> {report.post_snapshot.content}
                  </p>
                  <p className="mt-1">
                    <strong>Author:</strong>{" "}
                    {report.post_snapshot.author_data.name}
                  </p>
                  <p className="mt-1">
                    <strong>Snapshot Reason:</strong>{" "}
                    {report.post_snapshot.snapshot_reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Moderation History Component
interface ModerationHistoryListProps {
  history: ModerationHistoryResponse | undefined;
  loading: boolean;
  showSnapshots: boolean;
}

const ModerationHistoryList: React.FC<ModerationHistoryListProps> = ({
  history,
  loading,
  showSnapshots,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!history?.items?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No History Available
          </h3>
          <p className="text-gray-500">
            Moderation decisions will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.items.map((item: EnhancedModerationHistoryItem) => (
        <Card key={`${item.postId}-${item.decidedAt}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    item.decision === "retained"
                      ? "default"
                      : item.decision === "warned"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {formatDecision(item.decision)}
                </Badge>
                <span className="font-medium">Post #{item.postId}</span>
                <span className="text-sm text-gray-500">
                  {item.reportCount} report{item.reportCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                By {item.moderator.name} •{" "}
                {new Date(item.decidedAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {item.justification && (
              <div className="p-3 bg-gray-50 rounded mb-3">
                <strong className="text-sm">Justification:</strong>
                <p className="text-sm mt-1">{item.justification}</p>
              </div>
            )}

            {showSnapshots && item.postSnapshot && (
              <div className="p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Snapshot
                </h4>
                <div className="text-sm text-blue-800">
                  <p>
                    <strong>Title:</strong> {item.postSnapshot.title}
                  </p>
                  <p className="mt-1 line-clamp-2">
                    <strong>Content:</strong> {item.postSnapshot.content}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Analytics Component
interface ModerationAnalyticsProps {
  metrics: ModerationMetrics | undefined;
  loading: boolean;
  timeRange: string;
}

const ModerationAnalytics: React.FC<ModerationAnalyticsProps> = ({
  metrics,
  loading,
  timeRange,
}) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Decision Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content Retained</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.decisionDistribution.retained}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content Deleted</span>
              <span className="text-lg font-bold text-red-600">
                {metrics.decisionDistribution.deleted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Users Warned</span>
              <span className="text-lg font-bold text-yellow-600">
                {metrics.decisionDistribution.warned}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Unique Reporters</span>
              <span className="text-lg font-bold">
                {metrics.totalUniqueReporters}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Reports/Post</span>
              <span className="text-lg font-bold">
                {metrics.avgReportsPerPost.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Report Accuracy</span>
              <span className="text-lg font-bold text-purple-600">
                {Math.round(metrics.reportAccuracy * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Response Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Median Response</span>
              <span className="text-lg font-bold text-blue-600">
                {formatDuration(metrics.medianTimeToDecisionSec)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Decisions ({timeRange})
              </span>
              <span className="text-lg font-bold">
                {metrics.decisionsLast7d}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Reports</span>
              <span
                className={`text-lg font-bold ${
                  metrics.pendingCount > 10
                    ? "text-red-600"
                    : metrics.pendingCount > 5
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {metrics.pendingCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate Limit Entries</span>
              <span className="text-lg font-bold">
                {metrics.rateLimitEntriesCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModerationDashboard;
