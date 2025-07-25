// Moderation data structure and mock data
export interface ModerationReport {
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
}

export interface ModerationAction {
  id: string;
  postId: string;
  moderatorId: string;
  moderatorName: string;
  decision: "retained" | "deleted" | "warned";
  justification?: string;
  timestamp: Date;
}

export interface PostModerationStatus {
  postId: string;
  status: "pending" | "retained" | "deleted" | "warned";
  reports: ModerationReport[];
  action?: ModerationAction;
  reportCount: number;
  mostCommonReason: string;
}

// Post data interface for moderation
export interface MockPost {
  title: string;
  author: {
    name: string;
    location: string;
  };
  content: string;
  images: string[];
  video: string | null;
  timestamp: Date;
}

// Mock post data for moderation system
export const mockPosts: Record<string, MockPost> = {
  "post-1": {
    title: "Best Pig Feed Suppliers in Kigali - Looking for Quality Feed",
    author: { name: "John Farmer", location: "Kigali, Rwanda" },
    content:
      "I'm looking for reliable feed suppliers who can deliver quality feed for 50+ pigs. Budget is around 500,000 RWF per month. Anyone have recommendations?",
    images: ["/images/post_image.jpg"],
    video: null,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  "post-2": {
    title: "🔥 AMAZING PIG FEED DEALS!!! CHEAP PRICES!!!",
    author: { name: "Spammer Joe", location: "Unknown" },
    content:
      "BEST DEALS ON PIG FEED!!! CALL NOW 078XXXXXXX!!! LIMITED TIME OFFER!!! DISCOUNT DISCOUNT DISCOUNT!!!",
    images: [
      "/images/post_image2.jpg",
      "/images/post_image3.jpg",
      "/images/post_image4.jpg",
    ],
    video: null,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  "post-3": {
    title: "Sustainable Pig Farming Techniques Demo",
    author: { name: "Expert Farmer", location: "Musanze, Rwanda" },
    content:
      "Sharing my experience with sustainable farming techniques that have increased productivity while reducing environmental impact. Watch this demonstration video.",
    images: [], // No images when there's a video
    video: "/images/post_video.mp4",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  "post-4": {
    title: "Best Pig Feed Suppliers in Kigali - Quality Feed Recommendations",
    author: { name: "John Farmer", location: "Kigali, Rwanda" },
    content:
      "Comprehensive guide on maintaining pig health through proper vaccination schedules and preventive care measures.",
    images: [],
    video: null,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  "post-5": {
    title: "🔥 AMAZING PIG FEED DEALS!!! CHEAP PRICES!!!",
    author: { name: "Spam User", location: "Unknown" },
    content:
      "Current market trends showing price fluctuations and demand patterns for pig products across different regions.",
    images: ["/images/hero.png"],
    video: null,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  "post-6": {
    title: "Modern Pig Housing Construction Video Guide",
    author: { name: "Construction Pro", location: "Huye, Rwanda" },
    content:
      "Step-by-step video guide on building modern, efficient pig housing that improves animal welfare and productivity.",
    images: [],
    video: "/images/post_video.mp4",
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
  },
};

// Helper function to get post data by ID
export function getPostData(postId: string): MockPost {
  return (
    mockPosts[postId] || {
      title: "Sample Post Title",
      author: { name: "Anonymous User", location: "Rwanda" },
      content: "Sample post content for moderation review.",
      images: [],
      video: null,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    }
  );
}

// Mock data for development
export const mockReports: ModerationReport[] = [
  {
    id: "report-1",
    postId: "post-1",
    reporterId: "user-123",
    reporterName: "Sarah Johnson",
    reason: "inappropriate",
    details:
      "Contains offensive language and inappropriate content for farming community",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "report-2",
    postId: "post-1",
    reporterId: "user-456",
    reporterName: "Michael Brown",
    reason: "inappropriate",
    details: "Harassment towards other farmers",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: "report-3",
    postId: "post-1",
    reporterId: "user-789",
    reporterName: "Emma Wilson",
    reason: "inappropriate",
    details: "Hate speech and discriminatory language",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "report-4",
    postId: "post-2",
    reporterId: "user-321",
    reporterName: "David Lee",
    reason: "spam",
    details: "Repeated posting of the same content multiple times",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
  {
    id: "report-5",
    postId: "post-3",
    reporterId: "user-654",
    reporterName: "Lisa Chen",
    reason: "fraudulent",
    details: "Selling fake veterinary products with false claims",
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
  },
];

export const mockActions: ModerationAction[] = [
  {
    id: "action-1",
    postId: "post-4",
    moderatorId: "mod-1",
    moderatorName: "Admin Mike",
    decision: "retained",
    justification:
      "Content is relevant and factual. Reports appear to be false.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: "action-2",
    postId: "post-5",
    moderatorId: "mod-2",
    moderatorName: "Admin Sarah",
    decision: "deleted",
    justification:
      "Confirmed spam content with misleading information about pig farming practices.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "action-3",
    postId: "post-6",
    moderatorId: "mod-1",
    moderatorName: "Admin Mike",
    decision: "warned",
    justification:
      "Minor violation - author warned about proper citation of sources.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

// Helper function to get moderation status for posts (DEPRECATED - use getPendingModerationPosts)
export function getPostModerationStatus(): PostModerationStatus[] {
  return getPendingModerationPosts();
}

// Helper function to get moderation history (DEPRECATED - use getProcessedModerationHistory)
export function getModerationHistory(): (PostModerationStatus & {
  action: ModerationAction;
})[] {
  return getProcessedModerationHistory();
}

// Helper function to format reason labels
export function formatReasonLabel(reason: string): string {
  const labels = {
    inappropriate: "Inappropriate Content",
    spam: "Spam/Repetitive",
    fraudulent: "Fraudulent Listing",
    misinformation: "Misinformation",
    technical: "Technical Issues",
    other: "Other",
  };
  return labels[reason as keyof typeof labels] || reason;
}

// Helper function to get reason icon
export function getReasonIcon(reason: string): string {
  const icons = {
    inappropriate: "🚫",
    spam: "⚠️",
    fraudulent: "💰",
    misinformation: "❗",
    technical: "⚙️",
    other: "🏳️",
  };
  return icons[reason as keyof typeof icons] || "🏳️";
}

// Helper function to format time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}

// Helper function to truncate text with character limit
export function truncateText(
  text: string,
  maxLength: number
): { text: string; isTruncated: boolean } {
  if (text.length <= maxLength) return { text, isTruncated: false };
  return {
    text: text.substring(0, maxLength).trim() + "...",
    isTruncated: true,
  };
}

// Generate unique ID for new actions
function generateActionId(): string {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Function to process a moderation action
export function processModerationAction(
  postId: string,
  decision: "retained" | "deleted" | "warned",
  justification: string,
  moderatorName: string = "Current User"
): void {
  // Create new moderation action
  const newAction: ModerationAction = {
    id: generateActionId(),
    postId,
    moderatorId: "current-user", // In real app, get from auth context
    moderatorName,
    decision,
    justification,
    timestamp: new Date(),
  };

  // Add to actions array
  mockActions.unshift(newAction); // Add to beginning for latest first

  // Remove reports for this post from pending (simulate moving to resolved)
  const reportIndices: number[] = [];
  mockReports.forEach((report, index) => {
    if (report.postId === postId) {
      reportIndices.push(index);
    }
  });

  // Remove reports in reverse order to maintain indices
  reportIndices.reverse().forEach((index) => {
    mockReports.splice(index, 1);
  });

  console.log(`Moderation action processed: ${decision} for post ${postId}`);
  console.log(`Justification: ${justification}`);
  console.log(`Reports removed: ${reportIndices.length}`);
}

// Function to get current pending posts (excluding those with actions)
export function getPendingModerationPosts(): PostModerationStatus[] {
  // Get posts that have reports but no actions yet
  const actionedPostIds = new Set(mockActions.map((action) => action.postId));

  const postGroups = mockReports.reduce((groups, report) => {
    // Only include posts that haven't been actioned yet
    if (!actionedPostIds.has(report.postId)) {
      if (!groups[report.postId]) {
        groups[report.postId] = [];
      }
      groups[report.postId].push(report);
    }
    return groups;
  }, {} as Record<string, ModerationReport[]>);

  const pendingPosts = Object.entries(postGroups).map(([postId, reports]) => {
    // Find most common reason
    const reasonCounts = reports.reduce((counts, report) => {
      counts[report.reason] = (counts[report.reason] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonReason = Object.entries(reasonCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    return {
      postId,
      status: "pending" as const,
      reports: reports.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      ),
      reportCount: reports.length,
      mostCommonReason: formatReasonLabel(mostCommonReason),
    };
  });

  return pendingPosts.sort((a, b) => b.reportCount - a.reportCount);
}

// Function to get processed moderation history with report details
export function getProcessedModerationHistory(): (PostModerationStatus & {
  action: ModerationAction;
})[] {
  return mockActions
    .map((action) => {
      // In a real app, you would fetch the historical reports for this post
      // For now, we'll simulate some report data based on the action
      const simulatedReportCount = getSimulatedReportCount(action.postId);
      const simulatedMostCommonReason = getSimulatedMostCommonReason(
        action.postId
      );

      return {
        postId: action.postId,
        status: action.decision,
        reports: [], // Historical reports would be stored separately in real app
        action,
        reportCount: simulatedReportCount,
        mostCommonReason: simulatedMostCommonReason,
      };
    })
    .sort(
      (a, b) => b.action.timestamp.getTime() - a.action.timestamp.getTime()
    );
}

// Helper function to simulate report count for historical data
function getSimulatedReportCount(postId: string): number {
  const reportCounts: Record<string, number> = {
    "post-4": 2,
    "post-5": 5,
    "post-6": 1,
  };
  return reportCounts[postId] || 1;
}

// Helper function to simulate most common reason for historical data
function getSimulatedMostCommonReason(postId: string): string {
  const reasons: Record<string, string> = {
    "post-4": "Inappropriate Content",
    "post-5": "Spam/Repetitive",
    "post-6": "Other",
  };
  return reasons[postId] || "Other";
}
