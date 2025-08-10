import { baseApi } from "./baseApi";

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
  userVote: "upvote" | "downvote" | null;
  replies: number;
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
  message: string;
  data: {
    post: Post;
  };
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

export interface VoteResponse {
  success: boolean;
  message: string;
  data: {
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
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
      providesTags: ["Post"],
    }),

    // Create a new post
    createPost: builder.mutation<CreatePostResponse, FormData>({
      query: (formData) => ({
        url: "/discussions/posts",
        method: "POST",
        body: formData,
        // Don't set Content-Type header for FormData - browser will set it with boundary
        prepareHeaders: (headers: Headers) => {
          headers.delete("Content-Type");
          return headers;
        },
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
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
                const wasUpvoted = post.userVote === "upvote";
                const wasDownvoted = post.userVote === "downvote";

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
                    post.userVote = "upvote";
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
                    post.userVote = "downvote";
                  }
                }
              }
            })
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
  }),
});

// Export hooks for use in components
export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useVotePostMutation,
  useGetTagsQuery,
  useGetPostsStatsQuery,
} = discussionsApi;
