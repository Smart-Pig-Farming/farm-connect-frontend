import { baseApi } from "./baseApi";
import type { ReportResponse } from "../../types/moderation";

// Types for the discussions API
export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: number;
    firstname: string;
    lastname: string;
    avatar: string | null;
    level_id: number;
    points: number;
    location: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | "upvote" | "downvote" | null; // Accept both variants from API
  replies: number;
  shares: number; // Added to match API spec
  isMarketPost: boolean;
  isAvailable: boolean;
  createdAt: string;
  media: Array<{
    id: string;
    media_type: "image" | "video";
    url: string;
    thumbnail_url: string;
    original_filename: string;
    file_size: number;
    display_order: number;
  }>;
  images: Array<MediaItem>;
  video: MediaItem | null;
  isModeratorApproved: boolean;
}

// Moderation types
export type ModerationDecision = "retained" | "deleted" | "warned";

export interface ModerationReportItem {
  id: string;
  reason: string;
  details?: string;
  reporterId?: string | number;
  reporterName?: string;
  createdAt: string;
}

export interface ModerationPendingItem {
  postId: string;
  reportCount: number;
  mostCommonReason: string;
  post: Partial<Post>;
  reports: ModerationReportItem[];
}

export interface ModerationHistoryItem {
  postId: string;
  decision: ModerationDecision | string;
  moderator: { id: string | number; name?: string };
  decidedAt: string;
  count: number;
  justification?: string;
  post?: Partial<Post>;
}

// Metrics support removed

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
}

export interface MediaItem {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string;
  original_filename: string;
  file_size: number;
  display_order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      // Traditional pagination
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      hasNextPage?: boolean;

      // Infinite scroll
      nextCursor?: string;
      count?: number;
    };
    // Optional facets for header chips (per-tag counts and totals)
    facets?: {
      totals: { all: number };
      tags: Array<{ id: string; name: string; color: string; count: number }>;
    };
  };
}

export interface CreatePostResponse {
  success: boolean;
  data: { id: string; message: string };
}

export interface UploadMediaResponse {
  success: boolean;
  data: {
    media: Array<{
      id: string | number;
      media_type: "image" | "video";
      storage_key: string;
      file_name: string;
      file_size: number;
      mime_type: string;
      display_order: number;
    }>;
  };
}

export interface ApproveRejectResponse {
  success: boolean;
  data: { id: string; is_approved: boolean };
}

export interface TagsResponse {
  success: boolean;
  data: {
    tags: Tag[];
  };
}

export interface PostsStatsResponse {
  success: boolean;
  data: {
    totalDiscussions: number;
    postsToday: number;
  };
}

export interface MyPostsStatsResponse {
  success: boolean;
  data: {
    totalMyPosts: number;
    myPostsToday: number;
    approvedPosts: number;
    pendingPosts: number;
    marketPosts: number;
    regularPosts: number;
  };
}

export interface VoteResponse {
  success: boolean;
  message: string;
  data: {
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
  };
}

// Replies types
export interface ReplyItem {
  id: string;
  content: string;
  author: {
    id: number;
    firstname: string;
    lastname: string;
    avatar?: string | null;
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | "upvote" | "downvote" | null;
  childReplies?: ReplyItem[];
  depth?: number;
}

export interface RepliesResponse {
  success: boolean;
  data: {
    replies: ReplyItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}

// Query parameters interface
export interface PostsQueryParams {
  // Pagination (choose one approach)
  page?: number;
  cursor?: string;
  limit?: number;

  // Filtering & Search
  search?: string;
  tag?: string;
  sort?: "recent" | "popular" | "replies";
  is_market_post?: boolean;
  user_id?: number;
}

// My Posts specific query parameters (extends PostsQueryParams)
export interface MyPostsQueryParams {
  // Pagination (choose one approach)
  page?: number;
  cursor?: string;
  limit?: number;

  // Filtering & Search
  search?: string;
  tag?: string;
  sort?: "recent" | "popular" | "replies";
  is_market_post?: boolean;
  include_unapproved?: boolean; // Specific to my posts endpoint
}

// Create post form data interface
export interface CreatePostFormData {
  title: string;
  content: string;
  tags?: string[];
  is_market_post?: boolean;
  is_available?: boolean;
}

// API slice for discussions
export const discussionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get posts with cursor-based pagination (infinite scroll)
    getPosts: builder.query<PostsResponse, PostsQueryParams>({
      query: (params) => {
        // CRITICAL: Always include cursor parameter for cursor-based pagination
        // First page: cursor="" (empty string)
        // Subsequent pages: cursor="2025-08-09T08:22:38.033Z" (ISO timestamp)
        const queryParams = {
          ...params,
          cursor: params.cursor || "", // Force cursor parameter to trigger infinite scroll mode
        };

        console.log(
          "🌐 API Call to /discussions/posts with params:",
          queryParams
        );
        return {
          url: "/discussions/posts",
          params: queryParams,
        };
      },
      // Create unique cache keys based on filter params (excluding cursor)
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cursor: _cursor, ...filterParams } = queryArgs;
        return filterParams;
      },
      // Merge function to accumulate posts across pages
      merge: (currentCache, newItems, { arg }) => {
        console.log("RTK Query merge called:", {
          hasCursor: !!arg.cursor,
          cursorValue: arg.cursor,
          currentPostsCount: currentCache?.data?.posts?.length || 0,
          newPostsCount: newItems?.data?.posts?.length || 0,
          newHasNextPage: newItems?.data?.pagination?.hasNextPage,
          newNextCursor: newItems?.data?.pagination?.nextCursor,
        });

        // If cursor is empty string, this is the first page - replace entirely
        // If cursor has ISO timestamp, append posts to existing ones
        if (!arg.cursor || arg.cursor === "") {
          console.log("First page load - replacing cache");
          return newItems;
        }

        // If we have a cursor (ISO timestamp), append new posts to existing ones
        if (currentCache?.data?.posts && newItems?.data?.posts) {
          const mergedPosts = [
            ...currentCache.data.posts,
            ...newItems.data.posts,
          ];
          console.log("Appending posts:", {
            currentCount: currentCache.data.posts.length,
            newCount: newItems.data.posts.length,
            totalCount: mergedPosts.length,
            nextCursor: newItems.data.pagination?.nextCursor,
          });

          return {
            ...newItems,
            data: {
              ...newItems.data,
              posts: mergedPosts,
            },
          };
        }

        console.log("Fallback - returning new items");
        return newItems;
      },
      // Force refetch when cursor changes or filters change
      forceRefetch({ currentArg, previousArg }) {
        const shouldRefetch =
          currentArg?.cursor !== previousArg?.cursor ||
          currentArg?.search !== previousArg?.search ||
          currentArg?.tag !== previousArg?.tag ||
          currentArg?.sort !== previousArg?.sort ||
          currentArg?.is_market_post !== previousArg?.is_market_post;
        console.log("forceRefetch check:", {
          shouldRefetch,
          currentCursor: currentArg?.cursor,
          previousCursor: previousArg?.cursor,
          filterChanged:
            currentArg?.search !== previousArg?.search ||
            currentArg?.tag !== previousArg?.tag ||
            currentArg?.sort !== previousArg?.sort ||
            currentArg?.is_market_post !== previousArg?.is_market_post,
        });
        return shouldRefetch;
      },
      providesTags: (result) =>
        result?.data?.posts
          ? [
              ...result.data.posts.map(({ id }) => ({
                type: "Post" as const,
                id,
              })),
              { type: "Post" as const, id: "LIST" },
            ]
          : [{ type: "Post" as const, id: "LIST" }],
    }),

    // Update a post (partial fields)
    updatePost: builder.mutation<
      { success: boolean; data?: { id: string } },
      {
        id: string;
        data: {
          title?: string;
          content?: string;
          tags?: string[];
          is_market_post?: boolean;
          is_available?: boolean;
          // Accept either snake_case or camelCase from callers
          remove_images?: string[];
          remove_video?: boolean;
          removedImages?: string[];
          removedVideo?: boolean;
        };
      }
    >({
      query: ({ id, data }) => {
        // Normalize to backend expected keys: removedImages, removedVideo
        const normalized = {
          title: data.title,
          content: data.content,
          tags: data.tags,
          is_market_post: data.is_market_post,
          is_available: data.is_available,
          removedImages: data.removedImages ?? data.remove_images,
          removedVideo: data.removedVideo ?? data.remove_video,
        };
        return {
          url: `/discussions/posts/${id}`,
          method: "PATCH",
          body: normalized,
        };
      },
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistically update caches for both community and my posts lists
        const patches: Array<{ undo: () => void }> = [];
        const removeImages = (data.removedImages ?? data.remove_images) || [];
        const removeVideo = data.removedVideo ?? data.remove_video;

        const patchCommunity = dispatch(
          discussionsApi.util.updateQueryData(
            "getPosts",
            {} as PostsQueryParams,
            (draft: PostsResponse) => {
              const posts = draft?.data?.posts;
              const target = posts?.find((p) => p.id === id);
              if (target) {
                if (data.title !== undefined) target.title = data.title;
                if (data.content !== undefined) target.content = data.content;
                if (data.tags !== undefined) {
                  // Map string tag names back to API Tag shape minimally
                  target.tags = data.tags.map((name) => ({
                    id: name,
                    name,
                    color: "gray",
                  }));
                }
                if (data.is_market_post !== undefined)
                  target.isMarketPost = data.is_market_post;
                if (data.is_available !== undefined)
                  target.isAvailable = data.is_available;
                // Optimistically remove media by URL if requested
                if (Array.isArray(removeImages) && target.images) {
                  target.images = target.images.filter(
                    (img) => !removeImages.includes(img.url)
                  );
                }
                if (removeVideo && target.video) {
                  target.video = null;
                }
              }
            }
          )
        );

        const patchMyPosts = dispatch(
          discussionsApi.util.updateQueryData(
            "getMyPosts",
            {} as MyPostsQueryParams,
            (draft: PostsResponse) => {
              const posts = draft?.data?.posts;
              const target = posts?.find((p) => p.id === id);
              if (target) {
                if (data.title !== undefined) target.title = data.title;
                if (data.content !== undefined) target.content = data.content;
                if (data.tags !== undefined) {
                  target.tags = data.tags.map((name) => ({
                    id: name,
                    name,
                    color: "gray",
                  }));
                }
                if (data.is_market_post !== undefined)
                  target.isMarketPost = data.is_market_post;
                if (data.is_available !== undefined)
                  target.isAvailable = data.is_available;
                // Optimistically remove media by URL if requested
                if (Array.isArray(removeImages) && target.images) {
                  target.images = target.images.filter(
                    (img) => !removeImages.includes(img.url)
                  );
                }
                if (removeVideo && target.video) {
                  target.video = null;
                }
              }
            }
          )
        );

        try {
          patches.push(patchCommunity);
          patches.push(patchMyPosts);
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (_res, _err, { id }) => [{ type: "Post", id }],
    }),

    // Create a new post (JSON)
    createPost: builder.mutation<
      CreatePostResponse,
      {
        title: string;
        content: string;
        tags?: string[];
        is_market_post?: boolean;
        is_available?: boolean;
      }
    >({
      query: (body) => ({
        url: "/discussions/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    // Upload media for a post (multipart)
    uploadPostMedia: builder.mutation<
      UploadMediaResponse,
      { postId: string; files: File[] }
    >({
      query: ({ postId, files }) => {
        const fd = new FormData();
        files.forEach((f) => fd.append("media", f));
        return {
          url: `/discussions/posts/${postId}/media`,
          method: "POST",
          body: fd,
        } as const;
      },
    }),

    // Vote on a post
    votePost: builder.mutation<
      VoteResponse,
      { postId: string; vote_type: "upvote" | "downvote" }
    >({
      query: ({ postId, vote_type }) => ({
        url: `/discussions/posts/${postId}/vote`,
        method: "POST",
        body: { vote_type },
      }),
      // Optimistic updates for voting
      async onQueryStarted(
        { postId, vote_type },
        { dispatch, queryFulfilled }
      ) {
        // Optimistically update the post in cache
        const patchResults: Array<{ undo: () => void }> = [];

        // Update the infinite posts query cache
        patchResults.push(
          dispatch(
            discussionsApi.util.updateQueryData("getPosts", {}, (draft) => {
              const post = draft.data?.posts.find((p: Post) => p.id === postId);
              if (post) {
                const wasUpvoted = post.userVote === "up";
                const wasDownvoted = post.userVote === "down";

                if (vote_type === "upvote") {
                  if (wasUpvoted) {
                    // Remove upvote
                    post.upvotes -= 1;
                    post.userVote = null;
                  } else {
                    // Add upvote
                    post.upvotes += 1;
                    if (wasDownvoted) {
                      post.downvotes -= 1;
                    }
                    post.userVote = "up";
                  }
                } else {
                  if (wasDownvoted) {
                    // Remove downvote
                    post.downvotes -= 1;
                    post.userVote = null;
                  } else {
                    // Add downvote
                    post.downvotes += 1;
                    if (wasUpvoted) {
                      post.upvotes -= 1;
                    }
                    post.userVote = "down";
                  }
                }
              }
            })
          )
        );

        // Also update the My Posts cache so highlight persists in that view
        patchResults.push(
          dispatch(
            discussionsApi.util.updateQueryData(
              "getMyPosts",
              {},
              (draft: PostsResponse) => {
                const post = draft.data?.posts.find(
                  (p: Post) => p.id === postId
                );
                if (post) {
                  const wasUpvoted = post.userVote === "up";
                  const wasDownvoted = post.userVote === "down";

                  if (vote_type === "upvote") {
                    if (wasUpvoted) {
                      post.upvotes -= 1;
                      post.userVote = null;
                    } else {
                      post.upvotes += 1;
                      if (wasDownvoted) post.downvotes -= 1;
                      post.userVote = "up";
                    }
                  } else {
                    if (wasDownvoted) {
                      post.downvotes -= 1;
                      post.userVote = null;
                    } else {
                      post.downvotes += 1;
                      if (wasUpvoted) post.upvotes -= 1;
                      post.userVote = "down";
                    }
                  }
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on error
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    // Get all available tags
    getTags: builder.query<TagsResponse, void>({
      query: () => "/discussions/tags",
      providesTags: ["Tag"],
    }),

    // Get discussions statistics (header counts)
    getPostsStats: builder.query<PostsStatsResponse, void>({
      query: () => "/discussions/posts/stats",
    }),

    // Get statistics for the authenticated user's posts
    getMyPostsStats: builder.query<MyPostsStatsResponse, void>({
      query: () => "/discussions/my-posts/stats",
      providesTags: [{ type: "Post", id: "MY_POSTS" }],
    }),

    // Get posts created by the authenticated user
    getMyPosts: builder.query<PostsResponse, MyPostsQueryParams>({
      query: (params) => {
        const queryParams: Record<string, string> = {};

        // Always include cursor parameter for cursor-based pagination
        // Empty string for first page, ISO timestamp for subsequent pages
        if (params.cursor !== undefined) {
          queryParams.cursor = params.cursor;
        }

        // Add pagination parameters
        if (params.limit) queryParams.limit = params.limit.toString();
        if (params.page) queryParams.page = params.page.toString();

        // Add filtering parameters
        if (params.search) queryParams.search = params.search;
        if (params.tag && params.tag !== "All") queryParams.tag = params.tag;
        if (params.sort) queryParams.sort = params.sort;
        if (params.is_market_post !== undefined) {
          queryParams.is_market_post = params.is_market_post.toString();
        }
        if (params.include_unapproved !== undefined) {
          queryParams.include_unapproved = params.include_unapproved.toString();
        }

        return {
          url: "/discussions/my-posts",
          params: queryParams,
        };
      },
      // Create unique cache keys based on filter params (excluding cursor)
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cursor: _cursor, ...filterParams } = queryArgs;
        return filterParams;
      },
      // Merge function to accumulate posts across pages for infinite scroll
      merge: (currentCache, newItems, { arg }) => {
        const newCursor = arg.cursor;
        console.log("🔄 Merging my posts data:", {
          newCursor,
          currentCacheExists: !!currentCache,
          newItemsCount: newItems?.data?.posts?.length || 0,
          newCursorType: typeof newCursor,
        });

        // If cursor has ISO timestamp, append posts to existing ones
        if (currentCache && newCursor && typeof newCursor === "string") {
          console.log(
            "📝 Current cache posts:",
            currentCache.data?.posts?.length || 0
          );
          console.log(
            "📝 New posts to append:",
            newItems?.data?.posts?.length || 0
          );

          // If we have a cursor (ISO timestamp), append new posts to existing ones
          const mergedData = {
            ...newItems,
            data: {
              ...newItems.data,
              posts: [
                ...(currentCache.data?.posts || []),
                ...(newItems.data?.posts || []),
              ],
            },
          };

          console.log("Appending my posts:", {
            previousCount: currentCache.data?.posts?.length || 0,
            newCount: newItems.data?.posts?.length || 0,
            totalCount: mergedData.data?.posts?.length || 0,
            nextCursor: newItems.data?.pagination?.nextCursor,
            hasNextPage: newItems.data?.pagination?.hasNextPage,
          });

          return mergedData;
        }

        // For first page (no cursor or empty cursor), return new data
        console.log("🆕 Returning fresh my posts data (first page)");
        return newItems;
      },
      providesTags: (result) =>
        result?.data?.posts
          ? [
              ...result.data.posts.map(({ id }) => ({
                type: "Post" as const,
                id,
              })),
              { type: "Post", id: "MY_POSTS" },
            ]
          : [{ type: "Post", id: "MY_POSTS" }],
    }),

    // Admin moderation
    approvePost: builder.mutation<
      ApproveRejectResponse,
      { id: string; authorId: number }
    >({
      query: ({ id }) => ({
        url: `/admin/discussions/posts/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Post" as const, id: arg.id },
        { type: "User" as const, id: arg.authorId },
        { type: "User" as const, id: "LEADERBOARD" },
        { type: "User" as const, id: "ME_SCORE" }, // safe broad invalidation to refresh own score if needed
      ],
    }),
    rejectPost: builder.mutation<
      ApproveRejectResponse,
      { id: string; authorId: number }
    >({
      query: ({ id }) => ({
        url: `/admin/discussions/posts/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Post" as const, id: arg.id },
        { type: "User" as const, id: arg.authorId },
        { type: "User" as const, id: "LEADERBOARD" },
        { type: "User" as const, id: "ME_SCORE" },
      ],
    }),

    // Moderation: report a post
    reportPostModeration: builder.mutation<
      ReportResponse,
      { id: string; reason: string; details?: string }
    >({
      query: ({ id, reason, details }) => ({
        url: `/moderation/posts/${id}/report`,
        method: "POST",
        body: { reason, details },
      }),
      invalidatesTags: [{ type: "Report", id: "PENDING" }],
    }),

    // Moderation: report a reply
    reportReplyModeration: builder.mutation<
      ReportResponse,
      { id: string; reason: string; details?: string }
    >({
      query: ({ id, reason, details }) => ({
        url: `/moderation/replies/${id}/report`,
        method: "POST",
        body: { reason, details },
      }),
      invalidatesTags: [{ type: "Report", id: "PENDING" }],
    }),

    // Moderation: fetch pending queue (pagination supported)
    getPendingModeration: builder.query<
      {
        success: boolean;
        data: ModerationPendingItem[];
        pagination?: PaginationMeta;
      },
      { search?: string; page?: number; limit?: number }
    >({
      query: ({ search, page, limit } = {}) => ({
        url: `/moderation/pending`,
        params: {
          ...(search ? { search } : {}),
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
        },
      }),
      providesTags: [{ type: "Report", id: "PENDING" }],
    }),

    // Moderation: take a decision on a post
    decideModeration: builder.mutation<
      {
        success: boolean;
        data: {
          postId: string;
          decision: "retained" | "deleted" | "warned";
          reportCount: number;
        };
      },
      {
        postId: string;
        decision: "retained" | "deleted" | "warned";
        justification?: string;
      }
    >({
      query: ({ postId, decision, justification }) => ({
        url: `/moderation/posts/${postId}/decision`,
        method: "POST",
        body: { decision, justification },
      }),
      invalidatesTags: [
        { type: "Report", id: "PENDING" },
        { type: "Post", id: "LIST" },
        { type: "Post", id: "MY_POSTS" },
      ],
    }),

    // Moderation: history (pagination supported)
    getModerationHistory: builder.query<
      {
        success: boolean;
        data: ModerationHistoryItem[];
        pagination?: PaginationMeta;
      },
      {
        from?: string;
        to?: string;
        decision?: ModerationDecision;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: (params = {}) => ({ url: `/moderation/history`, params }),
      providesTags: [{ type: "Report", id: "HISTORY" }],
    }),

    // Metrics endpoint was removed

    // Delete a post (soft delete on server)
    deletePost: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/discussions/posts/${id}`,
        method: "DELETE",
      }),
      // After delete, invalidate lists so active queries refetch without the post
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        { type: "Post", id: "MY_POSTS" },
      ],
    }),

    // Get replies for a post (paginated)
    getReplies: builder.query<
      RepliesResponse,
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 1, limit = 20 }) => ({
        url: `/discussions/posts/${postId}/replies`,
        params: { page, limit },
      }),
      providesTags: (_res, _err, { postId }) => [
        { type: "Reply", id: `LIST_${postId}` },
      ],
    }),

    // Add a reply to a post (or nested via parent_reply_id)
    addReply: builder.mutation<
      { success: boolean; data: { id: string; message: string } },
      { postId: string; content: string; parent_reply_id?: string }
    >({
      query: ({ postId, content, parent_reply_id }) => ({
        url: `/discussions/posts/${postId}/replies`,
        method: "POST",
        body: { content, parent_reply_id },
      }),
      invalidatesTags: (_res, _err, { postId }) => [
        { type: "Reply", id: `LIST_${postId}` },
      ],
    }),

    // Vote on a reply
    voteReply: builder.mutation<
      VoteResponse,
      { replyId: string; vote_type: "upvote" | "downvote"; postId: string }
    >({
      query: ({ replyId, vote_type }) => ({
        url: `/discussions/replies/${replyId}/vote`,
        method: "POST",
        body: { vote_type },
      }),
      // Keep replies list fresh
      invalidatesTags: (_res, _err, { postId }) => [
        { type: "Reply", id: `LIST_${postId}` },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetPostsQuery,
  useGetMyPostsQuery,
  useGetMyPostsStatsQuery,
  useCreatePostMutation,
  useUploadPostMediaMutation,
  useVotePostMutation,
  useGetTagsQuery,
  useGetPostsStatsQuery,
  useApprovePostMutation,
  useRejectPostMutation,
  useDeletePostMutation,
  useGetRepliesQuery,
  useAddReplyMutation,
  useVoteReplyMutation,
  useUpdatePostMutation,
  useReportPostModerationMutation,
  useReportReplyModerationMutation,
  useGetPendingModerationQuery,
  useDecideModerationMutation,
  useGetModerationHistoryQuery,
} = discussionsApi;
