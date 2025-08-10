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
  // This can be enhanced later with proper date formatting
  return dateString;
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
