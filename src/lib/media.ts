// Utilities to pick thumbnails from API post/media structures (typed to avoid any)
import type { PostMediaLike } from "@/types/postMedia";

export function getPostCoverThumbnail(post: PostMediaLike): string | null {
  if (post?.video?.thumbnail_url) return post.video.thumbnail_url || null;
  if (post?.images?.length && post.images[0]?.thumbnail_url)
    return post.images[0].thumbnail_url || null;
  const firstMediaThumb = post?.media?.find(
    (m) => !!m?.thumbnail_url
  )?.thumbnail_url;
  return firstMediaThumb || null;
}

export function getVideoThumbnail(post: PostMediaLike): string | null {
  if (post?.video?.thumbnail_url) return post.video.thumbnail_url || null;
  const firstVideo = post?.media?.find(
    (m) => m?.media_type === "video" && !!m?.thumbnail_url
  )?.thumbnail_url;
  return firstVideo || null;
}
