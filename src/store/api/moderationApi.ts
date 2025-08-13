// Enhanced moderation API with rate limiting, snapshots, and real-time updates
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  EnhancedModerationReport,
  PostSnapshot,
  EnhancedModerationHistoryItem,
  ReportResponse,
  BulkModerationRequest,
  BulkModerationResponse,
  ModerationFilters,
  RateLimitError,
  PendingModerationItem,
  ModerationHistoryResponse,
} from "../../types/moderation";
import type { Post } from "./discussionsApi";

export interface PendingReportsResponse {
  reports: PendingModerationItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const moderationApi = createApi({
  reducerPath: "moderationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/moderation",
    credentials: "include",
  }),
  tagTypes: ["PendingReports", "ModerationHistory"],
  endpoints: (builder) => ({
    // Get pending moderation reports with enhanced data
    getPendingReports: builder.query<
      PendingReportsResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        timeRange?: "24h" | "7days" | "30days" | "90days" | "all";
      }
    >({
      query: ({ page = 1, limit = 10, search, timeRange }) => ({
        url: "/pending",
        params: { page, limit, search, timeRange },
      }),
      providesTags: ["PendingReports"],
    }),

    // Create a report with rate limiting
    createReport: builder.mutation<
      ReportResponse,
      {
        postId: string;
        reason: EnhancedModerationReport["reason"];
        details?: string;
      }
    >({
      query: (reportData) => ({
        url: "/report",
        method: "POST",
        body: reportData,
      }),
  invalidatesTags: ["PendingReports"],
      transformErrorResponse: (response: { status: number; data: unknown }) => {
        // Handle rate limit errors specifically
        if (response.status === 429) {
          const errorData = response.data as RateLimitError;
          return {
            status: 429,
            data: errorData,
            message:
              errorData.reason === "hourly_limit_exceeded"
                ? `Too many reports in the last hour. Try again in ${Math.ceil(
                    (errorData.retryAfter || 0) / 60
                  )} minutes.`
                : `Cannot report this content again so soon. Try again in ${Math.ceil(
                    (errorData.retryAfter || 0) / 3600
                  )} hours.`,
          };
        }

        // Handle cooldown errors (400 status)
        if (response.status === 400) {
          const errorData = response.data as {
            success: false;
            error: string;
            cooldownHours?: number;
            reason?: string;
          };

          if (errorData.cooldownHours) {
            return {
              status: 400,
              data: errorData,
              message: `This content was recently moderated. You can report it again in ${errorData.cooldownHours} hours.`,
            };
          }

          return {
            status: 400,
            data: errorData,
            message: errorData.error || "Cannot submit report at this time.",
          };
        }

        return response;
      },
    }),

    // Make moderation decision with enhanced logic
    makeDecision: builder.mutation<
      { success: boolean; postSnapshot?: PostSnapshot },
      {
        reportId: string;
        decision: "retained" | "deleted" | "warned";
        justification: string;
      }
    >({
      query: (decisionData) => ({
        url: `/decide/${decisionData.reportId}`,
        method: "POST",
        body: {
          decision: decisionData.decision,
          justification: decisionData.justification,
        },
      }),
  invalidatesTags: ["PendingReports", "ModerationHistory"],
    }),

    // Bulk moderation decisions
    makeBulkDecision: builder.mutation<
      BulkModerationResponse,
      BulkModerationRequest
    >({
      query: (bulkData) => ({
        url: "/bulk-decide",
        method: "POST",
        body: bulkData,
      }),
  invalidatesTags: ["PendingReports", "ModerationHistory"],
    }),

    // Get moderation history with snapshots
    getModerationHistory: builder.query<
      ModerationHistoryResponse,
      ModerationFilters
    >({
      query: ({ page = 1, limit = 10, search, timeRange, decision }) => ({
        url: "/history",
        params: { page, limit, search, timeRange, decision },
      }),
      providesTags: ["ModerationHistory"],
    }),

    // Get post snapshot by report ID
    getPostSnapshot: builder.query<PostSnapshot, string>({
      query: (reportId) => `/snapshot/${reportId}`,
    }),

    // Compare post versions (before and after)
    comparePostVersions: builder.query<
      {
        original: PostSnapshot;
        current?: Partial<Post>;
        differences: Array<{
          field: string;
          before: string | number | boolean | null;
          after: string | number | boolean | null;
        }>;
      },
      string
    >({
      query: (postId) => `/compare/${postId}`,
    }),

  // Metrics & analytics endpoints removed

    // Reopen a closed report (if conditions are met)
    reopenReport: builder.mutation<
      { success: boolean; message: string },
      {
        postId: string;
        reason: string;
        details?: string;
      }
    >({
      query: (reopenData) => ({
        url: "/reopen",
        method: "POST",
        body: reopenData,
      }),
      invalidatesTags: ["PendingReports", "ModerationHistory"],
    }),

    // Get user's report rate limit status
    getRateLimitStatus: builder.query<
      {
        canReport: boolean;
        retryAfter?: number;
        reason?: string;
        cooldownHours?: number;
      },
      { postId?: string; userId?: number }
    >({
      query: ({ postId, userId }) => ({
        url: "/rate-limit-status",
        params: { postId, userId },
      }),
    }),

    // Get detailed report information
    getReportDetails: builder.query<
      {
        report: PendingModerationItem;
        relatedReports: Array<{
          id: string;
          reason: string;
          reporter: string;
          created_at: string;
        }>;
        postSnapshot?: PostSnapshot;
        reporterHistory: {
          totalReports: number;
          accuracyRate: number;
          recentReports: number;
        };
      },
      string
    >({
      query: (reportId) => `/report/${reportId}`,
    }),

    // Search moderation items with advanced filters
    searchModerationItems: builder.query<
      {
        pending: PendingModerationItem[];
        history: EnhancedModerationHistoryItem[];
        totalResults: number;
      },
      {
        query: string;
        filters: {
          includeHistory?: boolean;
          includePending?: boolean;
          timeRange?: string;
          decision?: string;
          moderator?: string;
        };
        page?: number;
        limit?: number;
      }
    >({
      query: ({ query, filters, page = 1, limit = 20 }) => ({
        url: "/search",
        params: { q: query, ...filters, page, limit },
      }),
    }),

    // Export moderation data
    exportModerationData: builder.mutation<
      { downloadUrl: string },
      {
        format: "csv" | "json" | "xlsx";
        filters: ModerationFilters;
        includeSnapshots?: boolean;
      }
    >({
      query: (exportParams) => ({
        url: "/export",
        method: "POST",
        body: exportParams,
      }),
    }),

    // Get moderator performance stats
    getModeratorStats: builder.query<
      {
        moderatorId: number;
        name: string;
        stats: {
          totalDecisions: number;
          averageResponseTime: number;
          decisionDistribution: Record<string, number>;
          accuracyScore: number;
          recentActivity: Array<{
            date: string;
            decisions: number;
            avgResponseTime: number;
          }>;
        };
      },
      number
    >({
      query: (moderatorId) => `/moderator/${moderatorId}/stats`,
    }),
  }),
});

// Export hooks for components to use
export const {
  useGetPendingReportsQuery,
  useCreateReportMutation,
  useMakeDecisionMutation,
  useMakeBulkDecisionMutation,
  useGetModerationHistoryQuery,
  useGetPostSnapshotQuery,
  useComparePostVersionsQuery,
  useReopenReportMutation,
  useGetRateLimitStatusQuery,
  useGetReportDetailsQuery,
  useSearchModerationItemsQuery,
  useExportModerationDataMutation,
  useGetModeratorStatsQuery,
} = moderationApi;

// Utility functions for handling responses
export const isModerationRateLimitError = (
  error: unknown
): error is { status: 429; data: RateLimitError } => {
  return (
    (error as { status?: number })?.status === 429 &&
    (error as { data?: { reason?: string } })?.data?.reason !== undefined
  );
};

export const formatModerationReason = (
  reason: EnhancedModerationReport["reason"]
): string => {
  const reasonMap: Record<EnhancedModerationReport["reason"], string> = {
    inappropriate: "Inappropriate Content",
    spam: "Spam",
    fraudulent: "Fraudulent Activity",
    misinformation: "Misinformation",
    technical: "Technical Issue",
    other: "Other",
  };
  return reasonMap[reason] || reason;
};

export const formatDecision = (
  decision: "retained" | "deleted" | "warned"
): string => {
  const decisionMap = {
    retained: "Content Retained",
    deleted: "Content Removed",
    warned: "User Warned",
  };
  return decisionMap[decision] || decision;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export const formatRetryAfter = (retryAfter: number): string => {
  const now = Date.now();
  const retryTime = new Date(retryAfter);
  const diffSeconds = Math.floor((retryTime.getTime() - now) / 1000);

  if (diffSeconds <= 0) return "now";
  return `in ${formatDuration(diffSeconds)}`;
};

// Real-time update handlers for WebSocket integration
export const handleModerationUpdate = (
  data: { type: string; payload?: unknown },
  dispatch: (action: { type: string; payload: unknown[] }) => void
) => {
  const { type } = data;

  switch (type) {
    case "moderation_report_created":
      dispatch(
        moderationApi.util.invalidateTags([
          "PendingReports",
        ])
      );
      break;

    case "moderation_decision_made":
      dispatch(
        moderationApi.util.invalidateTags([
          "PendingReports",
          "ModerationHistory",
        ])
      );
      break;

    case "moderation_report_reopened":
      dispatch(
        moderationApi.util.invalidateTags([
          "PendingReports",
          "ModerationHistory",
        ])
      );
      break;
  }
};

export default moderationApi;
