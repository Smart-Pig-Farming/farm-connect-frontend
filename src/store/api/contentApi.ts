import { baseApi } from "./baseApi";

// Types for posts and conversations
export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  isMarketPost: boolean;
  isStillAvailable?: boolean;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    farmName?: string;
    level: "Newcomer" | "Amateur" | "Contributor" | "Knight" | "Expert";
    profilePicture?: string;
  };
  upvotes: number;
  downvotes: number;
  repliesCount: number;
  isApproved?: boolean;
  moderatorApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    farmName?: string;
    level: "Newcomer" | "Amateur" | "Contributor" | "Knight" | "Expert";
    profilePicture?: string;
  };
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
  mediaFile?: File;
  isMarketPost?: boolean;
  isStillAvailable?: boolean;
}

export interface CreateReplyRequest {
  content: string;
  postId: string;
}

export interface ReportRequest {
  type: "post" | "reply";
  itemId: string;
  reason: string;
  comment?: string;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  steps: string[];
  benefits: string[];
  tags: string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: "vet" | "government" | "admin";
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBestPracticeRequest {
  title: string;
  description: string;
  steps: string[];
  benefits: string[];
  tags: string[];
  mediaFile?: File;
}

// Posts and content API slice
export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get posts with filters
    getContentPosts: builder.query<
      { posts: Post[]; total: number },
      {
        page?: number;
        limit?: number;
        tags?: string[];
        search?: string;
        authorId?: string;
      }
    >({
      query: (params) => ({
        url: "/posts",
        params,
      }),
      providesTags: ["Post"],
    }),

    // Get single post with replies
    getPost: builder.query<{ post: Post; replies: Reply[] }, string>({
      query: (id) => `/posts/${id}`,
      providesTags: ["Post", "Comment"],
    }),

    // Create new post
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "tags" && Array.isArray(value)) {
            value.forEach((tag) => formData.append("tags[]", tag));
          } else if (key === "mediaFile" && value instanceof File) {
            formData.append("media", value);
          } else if (value !== undefined) {
            formData.append(key, String(value));
          }
        });

        return {
          url: "/posts",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Post"],
    }),

    // Update post
    updatePost: builder.mutation<
      Post,
      { id: string; data: Partial<CreatePostRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Post"],
    }),

    // Delete post
    deletePost: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),

    // Create reply
    createReply: builder.mutation<Reply, CreateReplyRequest>({
      query: (data) => ({
        url: "/replies",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Comment", "Post"],
    }),

    // Vote on post
    votePost: builder.mutation<
      { upvotes: number; downvotes: number },
      { postId: string; type: "up" | "down" }
    >({
      query: ({ postId, type }) => ({
        url: `/posts/${postId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: ["Post"],
    }),

    // Vote on reply
    voteReply: builder.mutation<
      { upvotes: number; downvotes: number },
      { replyId: string; type: "up" | "down" }
    >({
      query: ({ replyId, type }) => ({
        url: `/replies/${replyId}/vote`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: ["Comment"],
    }),

    // Report content
    reportContent: builder.mutation<{ message: string }, ReportRequest>({
      query: (data) => ({
        url: "/reports",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Report"],
    }),

    // Get best practices
    getBestPractices: builder.query<
      BestPractice[],
      {
        tags?: string[];
        search?: string;
        authorId?: string;
      }
    >({
      query: (params) => ({
        url: "/best-practices",
        params,
      }),
      providesTags: ["BestPractice"],
    }),

    // Create best practice
    createBestPractice: builder.mutation<
      BestPractice,
      CreateBestPracticeRequest
    >({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (
            (key === "tags" || key === "steps" || key === "benefits") &&
            Array.isArray(value)
          ) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else if (key === "mediaFile" && value instanceof File) {
            formData.append("media", value);
          } else if (value !== undefined) {
            formData.append(key, String(value));
          }
        });

        return {
          url: "/best-practices",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["BestPractice"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetContentPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useCreateReplyMutation,
  useVotePostMutation,
  useVoteReplyMutation,
  useReportContentMutation,
  useGetBestPracticesQuery,
  useCreateBestPracticeMutation,
} = contentApi;
