// Enhanced moderation types for frontend
import type { Post } from "../store/api/discussionsApi";

export interface EnhancedModerationReport {
  id: string;
  postId: string;
  reporterId: string;
  reporterName: string;
  reason:
    | "inappropriate"
    | "spam"
    | "fraudulent"
    | "misinformation"
    | "technical"
    | "other";
  details?: string;
  timestamp: Date;
  rateLimitInfo?: {
    isRateLimited: boolean;
    retryAfter?: number;
    reason?: "hourly_limit_exceeded" | "content_cooldown";
  };
}

export interface PostSnapshot {
  id: string;
  content_report_id: string;
  post_id: string;
  title: string;
  content: string;
  author_data: {
    id: number;
    name: string;
    location?: string;
  };
  media_data?: Array<{
    type: "image" | "video";
    url: string;
    thumbnail_url?: string;
    display_order?: number;
  }>;
  tags_data?: string[];
  created_at: Date;
  snapshot_reason: string;
}

export interface EnhancedModerationHistoryItem {
  postId: string;
  decision: "retained" | "deleted" | "warned";
  moderator: {
    id: string | number;
    name: string;
  };
  decidedAt: string;
  reportCount: number;
  justification?: string;
  postSnapshot?: PostSnapshot; // NEW: Include snapshot data
  originalPost?: Partial<Post>; // For comparison
}

// Metrics types removed

export interface RateLimitError {
  error: string;
  retryAfter: number;
  reason: "hourly_limit_exceeded" | "content_cooldown";
}

export interface ReportResponse {
  success: boolean;
  data?: {
    id: string;
    reportCount: number;
    isReopened?: boolean;
    duplicate?: boolean;
    existingReportId?: string;
  };
  error?: string;
  retryAfter?: number;
  reason?: string;
  cooldownHours?: number;
}

export interface BulkModerationRequest {
  postIds: string[];
  decision: "retained" | "deleted" | "warned";
  justification: string;
}

export interface BulkModerationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    postId: string;
    error: string;
  }>;
}

// Enhanced notification types
export interface EnhancedNotification {
  id: string;
  userId: number;
  type:
    | "moderation_decision_reporter"
    | "moderation_decision_owner"
    | "post_reported"
    | "content_approved";
  title: string;
  message: string;
  actionUrl?: string;
  priority: "low" | "normal" | "high";
  data: {
    postId?: string;
    postTitle?: string;
    decision?: "retained" | "deleted" | "warned";
    justification?: string;
    reportReason?: string;
    triggerUser?: {
      id: number;
      name: string;
    };
  };
  created_at: string;
  read?: boolean;
}

// WebSocket event types
export interface ModerationUpdateData {
  postId: string;
  action: "reported" | "decided" | "reopened";
  details: {
    decision?: "retained" | "deleted" | "warned";
    reportCount?: number;
    moderatorId?: number;
    justification?: string;
  };
}

export interface ModerationDecisionData {
  postId: string;
  decision: "retained" | "deleted" | "warned";
  justification: string;
  moderatorId: number;
  decidedAt: string;
  reportCount: number;
}

export interface ModerationReportedData {
  id: string;
  contentId: string;
  contentType: "post" | "reply";
  reason: string;
  details?: string;
  reporterId: number;
  created_at: string;
}

// Form validation types
export interface ReportFormData {
  reason: EnhancedModerationReport["reason"];
  details?: string;
}

export interface ModerationDecisionFormData {
  decision: "retained" | "deleted" | "warned";
  justification: string;
}

// Filter and search types
export interface ModerationFilters {
  search?: string;
  timeRange?: "24h" | "7days" | "30days" | "90days" | "all";
  decision?: "retained" | "deleted" | "warned";
  page?: number;
  limit?: number;
}

// Add missing interface
export interface PendingModerationItem {
  id: string;
  post_id: string;
  reporter_id: number;
  reason:
    | "inappropriate"
    | "spam"
    | "fraudulent"
    | "misinformation"
    | "technical"
    | "other";
  details?: string;
  created_at: string;
  report_count: number;
  post: Partial<Post>;
  reporter: {
    id: number;
    firstname: string;
    lastname: string;
  };
  post_snapshot?: PostSnapshot;
}

// Add missing response interface
export interface ModerationHistoryResponse {
  items: EnhancedModerationHistoryItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Analytics types removed

// Component prop types
export interface ModerationCardProps {
  report: EnhancedModerationReport;
  postData?: Partial<Post>;
  onQuickAction: (
    postId: string,
    action: "retained" | "deleted" | "warned",
    justification?: string
  ) => Promise<void>;
  onViewDetails: (postId: string) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export interface ModerationHistoryCardProps {
  item: EnhancedModerationHistoryItem;
  showSnapshot?: boolean;
  onCompareVersions?: (before: PostSnapshot, after?: Partial<Post>) => void;
}

export interface ContentComparisonProps {
  original?: Partial<Post>;
  snapshot: PostSnapshot;
  decision: "retained" | "deleted" | "warned";
}

export interface ModerationToolbarProps {
  selectedCount: number;
  onBulkAction: (action: BulkModerationRequest) => void;
  onSelectAll: (checked: boolean) => void;
  showSnapshots: boolean;
  onToggleSnapshots: (show: boolean) => void;
  filters: ModerationFilters;
  onFiltersChange: (filters: ModerationFilters) => void;
}

// Utility function types
export type ReasonFormatter = (
  reason: EnhancedModerationReport["reason"]
) => string;
export type DurationFormatter = (seconds: number) => string;
export type NotificationFormatter = (
  notification: EnhancedNotification
) => string;
