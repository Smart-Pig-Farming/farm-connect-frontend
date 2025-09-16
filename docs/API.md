# API Documentation

## Overview

This document describes the API layer built with RTK Query, which handles all server communication, caching, and state synchronization in the FarmConnect application.

## Base API Configuration

### Base Query Setup (`src/store/api/baseApi.ts`)

The base API provides shared configuration for all endpoints:

```typescript
const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Post",
    "Reply",
    "Tag",
    "BestPractice",
    "Quiz",
    "Comment",
    "Report",
    "Notifications",
  ],
  endpoints: () => ({}),
});
```

**Key Features:**

- Automatic authentication via HTTP-only cookies
- CSRF token handling
- Automatic token refresh on 401 errors
- Centralized error handling
- Environment-aware base URL configuration

## Authentication API (`authApi.ts`)

### Endpoints

#### `login`

```typescript
login: builder.mutation<AuthResponse, LoginRequest>({
  query: (credentials) => ({
    url: "/auth/login",
    method: "POST",
    body: credentials,
  }),
  invalidatesTags: ["User"],
});
```

**Usage:**

```typescript
const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async (credentials) => {
  try {
    const result = await login(credentials).unwrap();
    // User is now authenticated via HTTP-only cookie
  } catch (error) {
    // Handle login error
  }
};
```

#### `registerFarmer`

```typescript
registerFarmer: builder.mutation<AuthResponse, RegisterFarmerRequest>({
  query: (userData) => ({
    url: "/auth/register/farmer",
    method: "POST",
    body: userData,
  }),
  invalidatesTags: ["User"],
});
```

#### `forgotPassword` & `resetPassword`

Password reset flow with OTP verification:

```typescript
// Step 1: Request reset
const [forgotPassword] = useForgotPasswordMutation();
await forgotPassword({ email: "user@example.com" });

// Step 2: Verify OTP
const [verifyOtp] = useVerifyOtpMutation();
const { resetToken } = await verifyOtp({ email, otp }).unwrap();

// Step 3: Reset password
const [resetPassword] = useResetPasswordMutation();
await resetPassword({ resetToken, newPassword });
```

#### `getCurrentUser`

Fetches current authenticated user data:

```typescript
const { data: user, isLoading } = useGetCurrentUserQuery();
```

## Discussions API (`discussionsApi.ts`)

### Post Management

#### `getPosts` - Infinite Scroll Posts

```typescript
getPosts: builder.query<PostsResponse, PostsQueryParams>({
  query: (params) => ({
    url: "/discussions/posts",
    params: {
      cursor: params.cursor || "",
      limit: params.limit || 10,
      tags: params.tags,
      search: params.search,
      sortBy: params.sortBy || "newest",
    },
  }),
  serializeQueryArgs: ({ queryArgs, endpointDefinition }) => {
    const { cursor, ...otherArgs } = queryArgs;
    return endpointDefinition.name + JSON.stringify(otherArgs);
  },
  merge: (currentCache, newItems, { arg }) => {
    if (arg.cursor && currentCache?.data?.posts) {
      return {
        ...newItems,
        data: {
          ...newItems.data!,
          posts: [...currentCache.data.posts, ...newItems.data!.posts],
        },
      };
    }
    return newItems;
  },
  forceRefetch: ({ currentArg, previousArg }) => {
    return currentArg?.cursor !== previousArg?.cursor;
  },
});
```

**Key Features:**

- Cursor-based pagination for infinite scroll
- Smart cache merging to append new posts
- Filter-based cache separation
- Optimistic updates for real-time feel

**Usage:**

```typescript
const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
  useInfiniteScroll({
    tags: ["health", "feed"],
    search: "pig nutrition",
    sortBy: "newest",
  });
```

#### `createPost`

```typescript
createPost: builder.mutation<CreatePostResponse, FormData>({
  query: (formData) => ({
    url: "/discussions/posts",
    method: "POST",
    body: formData,
  }),
  invalidatesTags: ["Post"],
});
```

**Usage with Media Upload:**

```typescript
const [createPost] = useCreatePostMutation();

const handleSubmit = async (data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("tags", JSON.stringify(data.tags));
  if (data.mediaFile) {
    formData.append("media", data.mediaFile);
  }

  await createPost(formData).unwrap();
};
```

#### `votePost`

```typescript
votePost: builder.mutation<VoteResponse, VoteRequest>({
  query: ({ postId, type }) => ({
    url: `/discussions/posts/${postId}/vote`,
    method: "POST",
    body: { type },
  }),
  // Optimistic update handled by WebSocket events
});
```

### Reply Management

#### `getReplies`

```typescript
getReplies: builder.query<RepliesResponse, { postId: string; limit?: number }>({
  query: ({ postId, limit = 20 }) => ({
    url: `/discussions/posts/${postId}/replies`,
    params: { limit },
  }),
  providesTags: (result, error, { postId }) => [
    { type: "Reply", id: `LIST_${postId}` },
  ],
});
```

#### `addReply`

```typescript
addReply: builder.mutation<ReplyResponse, AddReplyRequest>({
  query: ({ postId, content, parentId }) => ({
    url: `/discussions/posts/${postId}/replies`,
    method: "POST",
    body: { content, parentId },
  }),
  invalidatesTags: (result, error, { postId }) => [
    { type: "Reply", id: `LIST_${postId}` },
  ],
});
```

## User Management API (`userApi.ts`)

### Admin Operations

#### `getUsers` - Paginated User List

```typescript
getUsers: builder.query<UserListResponse, UserFilters & PaginationParams>({
  query: (params) => ({
    url: "/admin/users",
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      status: params.status,
      role: params.role,
    },
  }),
  providesTags: ["User"],
});
```

**Usage:**

```typescript
const { data, isLoading } = useGetUsersQuery({
  page: 1,
  limit: 20,
  search: "farmer",
  status: "active",
});
```

#### `createUser`

```typescript
createUser: builder.mutation<UserResponse, CreateUserData>({
  query: (userData) => ({
    url: "/admin/users",
    method: "POST",
    body: userData,
  }),
  invalidatesTags: ["User"],
});
```

#### User Status Management

```typescript
// Lock/unlock user
toggleUserLock: builder.mutation<UserResponse, number>({
  query: (id) => ({
    url: `/admin/users/${id}/lock`,
    method: "PATCH",
  }),
  invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
});

// Verify user email
verifyUser: builder.mutation<UserResponse, number>({
  query: (id) => ({
    url: `/admin/users/${id}/verify`,
    method: "PATCH",
  }),
  invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
});
```

## Moderation API (`moderationApi.ts`)

### Content Moderation

#### `getPendingReports`

```typescript
getPendingReports: builder.query<ModerationResponse, ModerationFilters>({
  query: (params) => ({
    url: "/moderation/reports/pending",
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      contentType: params.contentType,
      priority: params.priority,
    },
  }),
  providesTags: ["PendingReports"],
});
```

#### `makeDecision`

```typescript
makeDecision: builder.mutation<DecisionResponse, ModerationDecision>({
  query: ({ reportId, decision, reason }) => ({
    url: `/moderation/reports/${reportId}/decision`,
    method: "POST",
    body: { decision, reason },
  }),
  invalidatesTags: ["PendingReports", "ModerationHistory"],
});
```

**Usage:**

```typescript
const [makeDecision] = useMakeDecisionMutation();

const handleApprove = async (reportId: string) => {
  await makeDecision({
    reportId,
    decision: "approved",
    reason: "Content follows community guidelines",
  });
};
```

## Permissions API (`permissionsApi.ts`)

### Role-Based Access Control

#### `getUserPermissions`

```typescript
getUserPermissions: builder.query<UserPermissions, number>({
  query: (userId) => `/admin/users/${userId}/permissions`,
  transformResponse: (response: ApiResponse<UserPermissions>) => response.data,
});
```

#### `updateRolePermissions`

```typescript
updateRolePermissions: builder.mutation<
  void,
  {
    roleId: number;
    permissionIds: number[];
  }
>({
  query: ({ roleId, permissionIds }) => ({
    url: `/admin/roles/${roleId}/permissions`,
    method: "PUT",
    body: { permissionIds },
  }),
  invalidatesTags: ["RolePermission"],
});
```

## Best Practices API (`bestPracticesApi.ts`)

### Content Management

#### `getBestPractices`

```typescript
getBestPractices: builder.query<BestPractice[], BestPracticeFilters>({
  query: (params) => ({
    url: "/best-practices",
    params: {
      tags: params.tags,
      search: params.search,
      authorId: params.authorId,
      category: params.category,
    },
  }),
  providesTags: ["BestPractice"],
});
```

#### `createBestPractice`

```typescript
createBestPractice: builder.mutation<BestPractice, FormData>({
  query: (formData) => ({
    url: "/best-practices",
    method: "POST",
    body: formData,
  }),
  invalidatesTags: ["BestPractice"],
});
```

## Error Handling

### Standard Error Response Format

```typescript
interface ApiErrorResponse {
  status: number;
  data: {
    error: string;
    message: string;
    details?: any;
  };
}
```

### Error Handling Patterns

#### 1. Component-Level Error Handling

```typescript
const { data, error, isLoading } = useGetPostsQuery(filters);

if (error) {
  if ("status" in error) {
    // RTK Query error with status
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 403) {
      return <AccessDenied />;
    }
  }
  return <ErrorFallback error={error} />;
}
```

#### 2. Mutation Error Handling

```typescript
const [createPost, { isLoading }] = useCreatePostMutation();

const handleSubmit = async (data) => {
  try {
    await createPost(data).unwrap();
    toast.success("Post created successfully");
  } catch (error) {
    if (error.status === 413) {
      toast.error("File too large");
    } else if (error.status === 400) {
      toast.error(error.data.message || "Invalid data");
    } else {
      toast.error("Failed to create post");
    }
  }
};
```

## Caching Strategy

### Cache Tags

RTK Query uses tags for intelligent cache invalidation:

```typescript
// Post operations
providesTags: (result) => [
  ...result.posts.map(({ id }) => ({ type: "Post", id })),
  { type: "Post", id: "LIST" },
];

invalidatesTags: ["Post"]; // Invalidates all post-related cache
```

### Selective Cache Updates

```typescript
// Update specific post in cache
async onQueryStarted({ postId, voteType }, { dispatch, queryFulfilled }) {
  const patchResult = dispatch(
    discussionsApi.util.updateQueryData('getPosts', filters, (draft) => {
      const post = draft.posts.find(p => p.id === postId);
      if (post) {
        if (voteType === 'up') {
          post.upvotes += 1;
        } else {
          post.downvotes += 1;
        }
      }
    })
  );

  try {
    await queryFulfilled;
  } catch {
    patchResult.undo();
  }
}
```

## WebSocket Integration

RTK Query seamlessly integrates with WebSocket updates:

```typescript
// WebSocket event handler
socket.on("post:vote", (data) => {
  // Update all relevant caches
  store.dispatch(
    discussionsApi.util.updateQueryData("getPosts", undefined, (draft) => {
      const post = draft.posts.find((p) => p.id === data.postId);
      if (post) {
        post.upvotes = data.upvotes;
        post.downvotes = data.downvotes;
        post.userVote = data.userVote;
      }
    })
  );
});
```

## Performance Optimizations

### 1. Query Deduplication

RTK Query automatically deduplicates identical requests made within a short timeframe.

### 2. Background Refetching

```typescript
// Refetch on window focus
useGetPostsQuery(filters, {
  refetchOnFocus: true,
  refetchOnReconnect: true,
});
```

### 3. Selective Subscription

```typescript
// Only subscribe to specific fields
useGetPostsQuery(filters, {
  selectFromResult: ({ data, ...other }) => ({
    ...other,
    postTitles: data?.posts.map((p) => p.title) || [],
  }),
});
```

### 4. Polling for Real-time Updates

```typescript
useGetNotificationsQuery(undefined, {
  pollingInterval: 30000, // Poll every 30 seconds
});
```

## Type Safety

All API endpoints are fully typed:

```typescript
// Request types
interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
  mediaFile?: File;
}

// Response types
interface PostResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

// Hook usage with full type safety
const [createPost] = useCreatePostMutation();
const { data } = useGetPostsQuery({ tags: ["health"] });
//     ^-- PostResponse[] | undefined
```

## Testing API Endpoints

### Mock Service Worker Integration

```typescript
// tests/mocks/handlers.ts
export const handlers = [
  rest.get("/api/discussions/posts", (req, res, ctx) => {
    return res(
      ctx.json({
        posts: mockPosts,
        pagination: { hasNextPage: false },
      })
    );
  }),
];
```

### Testing Hooks

```typescript
// tests/hooks/useGetPosts.test.ts
import { renderHook } from "@testing-library/react";
import { useGetPostsQuery } from "../store/api/discussionsApi";

test("fetches posts successfully", async () => {
  const { result } = renderHook(() => useGetPostsQuery({}));

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data?.posts).toHaveLength(5);
});
```
