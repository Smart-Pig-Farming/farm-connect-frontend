// Shared lightweight type describing media-related fields present in REST and WS payloads
export type PostMediaLike = {
  id?: string | number;
  video?: { thumbnail_url?: string | null } | null;
  images?: Array<{ thumbnail_url?: string | null }>;
  media?: Array<{ media_type?: "image" | "video"; thumbnail_url?: string | null }>;
} | null | undefined;
