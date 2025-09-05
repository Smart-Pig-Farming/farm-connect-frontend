// Posts-related constants and utilities
import type { Post } from "../store/api/discussionsApi";

// Pagination Constants
export const POSTS_PER_PAGE = 5; // Initial load: 5 posts
export const POSTS_PER_LOAD_MORE = 10; // Subsequent loads: 10 posts each
export const LOADING_DEBOUNCE_DELAY = 300; // 300ms debounce for search

// Available tags for filtering (can be moved to API response later)
export const availableTags = [
  { name: "All", count: 27, color: "default" },
  { name: "General", count: 18, color: "blue" },
  { name: "Market", count: 7, color: "green" },
  { name: "Health", count: 6, color: "red" },
  { name: "Feed", count: 5, color: "yellow" },
  { name: "Equipment", count: 5, color: "purple" },
  { name: "Breeding", count: 0, color: "pink" },
  { name: "Events", count: 0, color: "orange" },
];

// Post utility functions
export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      // For dates older than a week, show the actual date
      return date.toLocaleDateString();
    }
  } catch {
    // Fallback for invalid date strings
    return dateString;
  }
};

export const calculateEngagementScore = (
  upvotes: number,
  downvotes: number,
  replies: number
): number => {
  return upvotes + replies * 2 - downvotes * 0.5;
};

// Post validation utilities
export const isValidPost = (
  post: Partial<Post> | undefined | null
): boolean => {
  return !!(post?.id && post?.title && post?.content && post?.author);
};

export const getPostTypeLabel = (isMarketPost: boolean): string => {
  return isMarketPost ? "Market" : "Discussion";
};
