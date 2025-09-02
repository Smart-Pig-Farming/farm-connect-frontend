// Enhanced error handling for moderation operations
import type { RateLimitError } from "@/types/moderation";

export interface ModerationError {
  message?: string;
  data?: {
    error?: string;
    cooldownHours?: number;
    retryAfter?: number;
    reason?: string;
  };
  status?: number;
}

export interface ErrorToastInfo {
  title: string;
  description?: string;
  duration?: number;
}

/**
 * Converts API errors into user-friendly toast messages for moderation operations
 */
export function formatModerationError(error: unknown): ErrorToastInfo {
  const apiError = error as ModerationError;

  // Rate limiting errors (429)
  if (apiError?.status === 429) {
    const rateLimitData = apiError.data as RateLimitError;
    if (rateLimitData?.reason === "hourly_limit_exceeded") {
      const waitMinutes = Math.ceil((rateLimitData.retryAfter || 0) / 60);
      return {
        title: "Too many reports submitted",
        description: `Please wait ${waitMinutes} minutes before reporting again`,
        duration: 5000,
      };
    } else if (rateLimitData?.reason === "content_cooldown") {
      const waitHours = Math.ceil((rateLimitData.retryAfter || 0) / 3600);
      return {
        title: "Already reported recently",
        description: `You can report this content again in ${waitHours} hours`,
        duration: 5000,
      };
    }

    return {
      title: "Too many reports",
      description: "Please wait before submitting another report",
      duration: 4000,
    };
  }

  // Cooldown errors (400)
  if (apiError?.status === 400) {
    if (apiError.data?.cooldownHours) {
      const hours = apiError.data.cooldownHours;
      const timeUnit = hours === 1 ? "hour" : "hours";
      return {
        title: "Content recently moderated",
        description: `You can report this again in ${hours} ${timeUnit}`,
        duration: 5000,
      };
    }

    if (apiError.data?.error) {
      return {
        title: apiError.data.error,
        duration: 4000,
      };
    }
  }

  // Use custom message if available
  if (apiError?.message) {
    return {
      title: apiError.message,
      duration: 4000,
    };
  }

  // Authentication errors (401)
  if (apiError?.status === 401) {
    return {
      title: "Please log in to report content",
      duration: 4000,
    };
  }

  // Permission errors (403)
  if (apiError?.status === 403) {
    return {
      title: "You don't have permission to report content",
      duration: 4000,
    };
  }

  // Not found errors (404)
  if (apiError?.status === 404) {
    return {
      title: "Content not found",
      description: "This content may have been deleted",
      duration: 4000,
    };
  }

  // Server errors (500+)
  if (apiError?.status && apiError.status >= 500) {
    return {
      title: "Server error occurred",
      description: "Please try again later",
      duration: 4000,
    };
  }

  // Default fallback
  return {
    title: "Could not submit report",
    description: "Please try again",
    duration: 4000,
  };
}

/**
 * Formats success messages for different report scenarios
 */
export function formatReportSuccess(response: {
  duplicate?: boolean;
  isReopened?: boolean;
  reportCount?: number;
}): ErrorToastInfo {
  if (response.duplicate) {
    return {
      title: "Report already submitted",
      description: `${
        response.reportCount || 1
      } reports pending for this content`,
      duration: 3000,
    };
  }

  if (response.isReopened) {
    return {
      title: "Report reopened successfully",
      description: "Thanks for helping keep the community safe",
      duration: 4000,
    };
  }

  return {
    title: "Report submitted successfully",
    description: "Thanks for helping keep the community safe",
    duration: 3000,
  };
}
