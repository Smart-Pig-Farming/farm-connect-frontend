import type { Post as ApiPost } from "@/store/api/discussionsApi";

// Shared UI-facing post shape used by discussion components (card, page, modals).
// It flattens media for simpler rendering, normalizes userVote to 'up' | 'down' | null,
// and adds optional transient UI-only fields.
export interface DiscussionPostUI
  extends Omit<ApiPost, "images" | "video" | "media" | "shares" | "userVote"> {
  images: string[]; // Flattened image URLs for quick grids
  video: string | null; // Single video URL (if any)
  coverThumb?: string | null; // Derived cover thumbnail (may be from first image or explicit media)
  videoThumbnail?: string | null; // Derived video thumbnail
  upvoterIds?: number[]; // Voter id arrays passed from API (optional)
  downvoterIds?: number[];
  repliesData?: { id: string }[]; // Lightweight replies placeholder for lazy loading
  __lastAuthorPointsDelta?: number; // Transient flash value for author point changes
  shares?: number; // Optional shares count if provided separately
  userVote: "up" | "down" | null; // Normalized user vote for UI logic
}
