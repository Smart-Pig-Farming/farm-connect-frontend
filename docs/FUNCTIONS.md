# Core Functions Documentation

## Overview

This document provides detailed documentation for the most important functions across the FarmConnect application, organized by module and functionality.

## State Management Functions

### Redux Store (`src/store/`)

#### Store Configuration (`src/store/index.ts`)

##### `configureStore()`

Creates and configures the Redux store with RTK Query integration.

```typescript
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});
```

**Key Features:**

- Persistence configuration for auth state
- RTK Query middleware integration
- Redux DevTools in development
- Non-serializable action filtering

#### Auth Slice (`src/store/slices/authSlice.ts`)

##### `setCredentials(user)`

Stores user authentication data after successful login.

```typescript
setCredentials: (state, action: PayloadAction<{ user: User }>) => {
  const { user } = action.payload;
  state.user = user;
  state.isAuthenticated = true;
  state.error = null;
};
```

##### `logout()`

Clears user session and resets authentication state.

```typescript
logout: (state) => {
  state.user = null;
  state.isAuthenticated = false;
  state.error = null;
};
```

#### UI Slice (`src/store/slices/uiSlice.ts`)

##### `setPostFilters(filters)`

Updates post filtering criteria with partial updates.

```typescript
setPostFilters: (
  state,
  action: PayloadAction<Partial<UiState["postFilters"]>>
) => {
  state.postFilters = { ...state.postFilters, ...action.payload };
};
```

##### `addNotification(notification)`

Adds a new notification with auto-generated ID.

```typescript
addNotification: (state, action: PayloadAction<Omit<Notification, "id">>) => {
  const notification = {
    ...action.payload,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  state.notifications.push(notification);
};
```

### Base API Query Functions (`src/store/api/baseApi.ts`)

#### `computeApiBaseUrl()`

Computes the API base URL with environment variable support and safe fallbacks.

```typescript
function computeApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl === "") return "/api"; // Relative usage

  if (!envUrl) return "http://localhost:3000/api"; // Fallback

  const normalized = envUrl.replace(/\/+$/, ""); // Remove trailing slashes

  // Don't double-append /api if already present
  if (normalized.toLowerCase().endsWith("/api")) {
    return normalized;
  }

  return `${normalized}/api`;
}
```

**Purpose:** Provides flexible API URL configuration for different environments.

#### `baseQueryWithReauth()`

Enhanced base query with automatic authentication refresh.

```typescript
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt refresh
    const refresh = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );
    if (refresh.data) {
      // Retry original request
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};
```

**Purpose:** Handles token refresh automatically when requests fail with 401 status.

## Custom Hooks

### WebSocket Hook (`src/hooks/useWebSocket.ts`)

#### `useWebSocket(handlers, options)`

Manages WebSocket connection lifecycle and event handling.

```typescript
export const useWebSocket = (
  handlers: WebSocketEventHandlers = {},
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  const typingTimeoutsRef = useRef(new Map<string, NodeJS.Timeout>());

  // Connection management
  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: options.forceNew || false,
    });

    socketRef.current = socket;

    // Event listeners setup...

    return () => {
      socket.disconnect();
    };
  }, []);
};
```

**Key Functions:**

##### `castVote(contentId, contentType, voteType)`

Emits vote events with acknowledgment handling.

```typescript
const castVote = useCallback(
  (
    contentId: string,
    contentType: "post" | "reply",
    voteType: "upvote" | "downvote" | null
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(`${contentType}:vote`, {
        [`${contentType}Id`]: contentId,
        voteType,
      });
    }
  },
  []
);
```

##### `startTyping(postId)` / `stopTyping(postId)`

Manages typing indicators with automatic timeout.

```typescript
const startTyping = useCallback(
  (postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start", { postId });

      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => stopTyping(postId), 3000);
      typingTimeoutsRef.current.set(postId, timeout);
    }
  },
  [stopTyping]
);
```

### Infinite Scroll Hook (`src/hooks/useInfiniteScroll.ts`)

#### `useInfiniteScroll(options)`

Provides cursor-based infinite scrolling with smart data merging.

```typescript
export function useInfiniteScroll(options: InfiniteScrollOptions) {
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState<string>("");
  const [allData, setAllData] = useState<Post[]>([]);

  const { data, isLoading, isFetching } = useGetPostsQuery({
    ...options.filters,
    cursor,
    limit: options.pageSize || 10,
  });

  // Smart data merging when new page loads
  useEffect(() => {
    if (data?.posts) {
      if (cursor === "") {
        // First page - replace all data
        setAllData(data.posts);
      } else {
        // Subsequent pages - append to existing data
        setAllData((prev) => [...prev, ...data.posts]);
      }

      setHasNextPage(data.pagination.hasNextPage);
    }
  }, [data, cursor]);

  const fetchNextPage = useCallback(() => {
    if (data?.pagination.nextCursor && !isFetching) {
      setCursor(data.pagination.nextCursor);
    }
  }, [data, isFetching]);

  return {
    data: allData,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  };
}
```

### Permissions Hook (`src/hooks/usePermissions.ts`)

#### `usePermissions()`

Provides role-based access control checking.

```typescript
export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
```

**Usage Examples:**

```typescript
const { hasPermission, hasAnyPermission } = usePermissions();

// Check single permission
if (hasPermission("MANAGE:USERS")) {
  // Show admin controls
}

// Check multiple permissions (OR logic)
if (hasAnyPermission(["MODERATE:POSTS", "DELETE:POSTS"])) {
  // Show moderation controls
}
```

### Voter Check Hook (`src/hooks/useVoterCheck.ts`)

#### `useVoterCheck(options)`

Checks if current user voted and fetches voter list for tooltips.

```typescript
export const useVoterCheck = (
  options: UseVoterCheckOptions
): VoterCheckResult => {
  const { postId, replyId, voteType, enabled = false } = options;
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  // Only fetch when enabled (e.g., on hover)
  const postVotersQuery = useGetPostVotersQuery(
    { postId: postId!, type: voteType, limit: 20 },
    { skip: !enabled || !postId }
  );

  const [isCurrentUserVoter, setIsCurrentUserVoter] = useState(false);

  useEffect(() => {
    if (data?.data && currentUserId) {
      const userInList = data.data.some(
        (voter) => voter.userId === currentUserId
      );
      setIsCurrentUserVoter(userInList);
    }
  }, [data, currentUserId]);

  return {
    isCurrentUserVoter,
    votersList: data?.data || [],
    isLoading,
    error,
  };
};
```

#### `useVoterTooltip(count, isCurrentUserVoter, votersList)`

Formats voter information for tooltip display.

```typescript
export const useVoterTooltip = (
  count: number,
  isCurrentUserVoter: boolean,
  votersList: VoterItem[]
): string => {
  if (count === 0) return "No votes yet";

  if (isCurrentUserVoter) {
    if (count === 1) return "You voted";

    const others = votersList.filter((v) => v.userId !== currentUserId);
    const names = others.slice(0, 3).map((v) => v.firstname || v.username);

    if (count === 2) return `You and ${names[0]}`;
    if (count <= 4) return `You, ${names.join(", ")}`;

    return `You and ${count - 1} others`;
  }

  // User hasn't voted
  const names = votersList.slice(0, 3).map((v) => v.firstname || v.username);
  if (count <= 3) return names.join(", ");

  return `${names.slice(0, 2).join(", ")} and ${count - 2} others`;
};
```

### Persistent Draft Hook (`src/components/bestPractices/hooks/usePersistentDraft.ts`)

#### `usePersistentDraft(options)`

Automatically persists form data to localStorage with debouncing.

```typescript
export function usePersistentDraft<T>({
  key,
  initial,
  debounceMs = 600,
  version = 1,
}: Options<T>) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial();

      const parsed: Stored<T> = JSON.parse(raw);
      if (parsed.v !== version) return initial(); // Version mismatch

      return parsed.data;
    } catch {
      return initial();
    }
  });

  const timer = useRef<number | undefined>(undefined);

  // Debounced save to localStorage
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        const payload: Stored<T> = {
          v: version,
          data: state,
          updated: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Ignore quota errors
      }
    }, debounceMs);

    return () => window.clearTimeout(timer.current);
  }, [state, key, debounceMs, version]);

  const clear = () => {
    localStorage.removeItem(key);
    setState(initial());
  };

  return { state, setState, clear } as const;
}
```

**Usage:**

```typescript
const { state, setState, clear } = usePersistentDraft({
  key: "best-practice-draft",
  initial: () => ({
    title: "",
    content: "",
    steps: [],
  }),
  version: 1,
});
```

## Utility Functions

### Class Name Utilities (`src/lib/utils.ts`)

#### `cn(...inputs)`

Combines and merges Tailwind CSS classes intelligently.

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Purpose:** Resolves conflicting Tailwind classes and combines conditional classes.

**Usage:**

```typescript
// Conditional classes
const buttonClass = cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed",
  className // Allow external overrides
);

// Conflicting classes resolution
cn("px-2 px-4"); // Results in 'px-4' (twMerge resolves conflicts)
```

### Socket Integration (`src/lib/socket.ts`)

#### WebSocket Event Handlers

##### `handlePostVoteUpdate(data)`

Updates RTK Query cache when vote events are received.

```typescript
socket.on("post:vote", (data: PostVoteData) => {
  import("@/store/utils/applyPostVoteWsUpdate").then(
    ({ applyPostVoteWsUpdate }) => {
      applyPostVoteWsUpdate({
        postId: data.postId,
        userId: data.userId,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        userVote: data.userVote,
      });
    }
  );
});
```

##### `handlePostCreation(data)`

Invalidates post caches and shows notifications for new posts.

```typescript
socket.on("post:create", (data: PostCreateData) => {
  // Show toast notification
  toast.info(`New post: ${data.title}`);

  // Invalidate cache to refetch posts
  store.dispatch(discussionsApi.util.invalidateTags(["Post"]));
});
```

### Post Utilities (`src/utils/posts.ts`)

#### Constants and Configuration

```typescript
// Pagination Constants
export const POSTS_PER_PAGE = 5; // Initial load
export const POSTS_PER_LOAD_MORE = 10; // Subsequent loads
export const LOADING_DEBOUNCE_DELAY = 300; // Search debounce

// Available tags with metadata
export const availableTags = [
  { name: "All", count: 27, color: "default" },
  { name: "General", count: 18, color: "blue" },
  { name: "Market", count: 7, color: "green" },
  { name: "Health", count: 6, color: "red" },
  { name: "Feed", count: 5, color: "yellow" },
  { name: "Equipment", count: 5, color: "purple" },
];
```

#### `formatPostDate(date)`

Formats post creation dates with relative time.

```typescript
export const formatPostDate = (date: string): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return postDate.toLocaleDateString();
};
```

#### `extractMentions(content)`

Extracts @mentions from post content.

```typescript
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return [...new Set(mentions)]; // Remove duplicates
};
```

### Error Handling Utilities (`src/utils/error.ts`)

#### `handleApiError(error)`

Standardizes API error handling across components.

```typescript
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as { status: number; data?: { message?: string } };

    switch (apiError.status) {
      case 400:
        return apiError.data?.message || "Invalid request";
      case 401:
        return "Authentication required";
      case 403:
        return "Access denied";
      case 404:
        return "Resource not found";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again.";
      default:
        return "An unexpected error occurred";
    }
  }

  return "Network error. Please check your connection.";
};
```

#### `showErrorToast(error, fallbackMessage)`

Shows appropriate error toasts based on error type.

```typescript
export const showErrorToast = (
  error: unknown,
  fallbackMessage = "Operation failed"
) => {
  const message = handleApiError(error);
  toast.error(message || fallbackMessage);
};
```

## Component Functions

### Discussion Components (`src/components/discussions/`)

#### Reply Management (`RepliesSection.tsx`)

##### `handleDeleteReply(replyId)`

Manages reply deletion with confirmation flow.

```typescript
const handleDeleteReply = useCallback(async (replyId: string) => {
  // Show confirmation toast with action buttons
  toast.custom(
    (t) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Delete Reply</h3>
            <p className="text-gray-600 text-xs mt-1">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => toast.dismiss(t)}>Cancel</button>
              <button onClick={() => confirmDelete(replyId, t)}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity }
  );
}, []);

const confirmDelete = async (replyId: string, toastId: string) => {
  toast.dismiss(toastId);

  // Show loading toast after confirmation
  toast.promise(
    deleteReply({ id: replyId, postId })
      .unwrap()
      .then(() => {
        // Optimistic update
        setLocalReplies((prev) => prev.filter((r) => r.id !== replyId));
      }),
    {
      loading: "Deleting reply...",
      success: "Reply deleted successfully",
      error: "Failed to delete reply",
    }
  );
};
```

##### `handleVoteReply(replyId, voteType)`

Manages reply voting with optimistic updates.

```typescript
const handleVoteReply = async (replyId: string, voteType: "up" | "down") => {
  // Optimistic UI update
  setLocalReplies((prev) => {
    const updateReply = (replies: Reply[]): Reply[] =>
      replies.map((reply) => {
        if (reply.id !== replyId) {
          if (reply.replies?.length) {
            return { ...reply, replies: updateReply(reply.replies) };
          }
          return reply;
        }

        const current = reply.userVote;
        let up = reply.upvotes;
        let down = reply.downvotes;
        let next: "up" | "down" | null = voteType;

        if (current === voteType) {
          // Toggle off
          next = null;
          if (voteType === "up") up = Math.max(0, up - 1);
          else down = Math.max(0, down - 1);
        } else {
          // Switch or add new vote
          if (current === "up") up = Math.max(0, up - 1);
          if (current === "down") down = Math.max(0, down - 1);
          if (voteType === "up") up += 1;
          else down += 1;
        }

        return { ...reply, upvotes: up, downvotes: down, userVote: next };
      });

    return updateReply(prev);
  });

  try {
    await voteReply({ id: replyId, postId, type: voteType }).unwrap();
  } catch {
    // Revert on error
    refetch();
    toast.error("Failed to vote on reply");
  }
};
```

### UI Components (`src/components/ui/`)

#### Dropdown Menu (`dropdown-menu.tsx`)

##### Portal-Based Positioning

```typescript
export function DropdownMenuContent({
  align = "start",
  className = "",
  children,
}) {
  const { isOpen, triggerRef, contentRef } = useContext(DropdownMenuContext);
  const [coords, setCoords] = useState({ top: 0, left: 0, triggerWidth: 0 });

  // Position calculation with portal rendering
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      triggerWidth: rect.width,
    });
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  // Calculate alignment
  let computedLeft = coords.left;
  if (align === "end" && contentRef.current) {
    computedLeft =
      coords.left + coords.triggerWidth - contentRef.current.offsetWidth;
  }

  const menu = (
    <div
      ref={contentRef}
      className={cn("min-w-[8rem] ...", className)}
      style={{
        position: "absolute",
        top: coords.top,
        left: Math.max(8, computedLeft),
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
}
```

**Purpose:** Renders dropdown content in a portal to avoid z-index stacking issues.

## Performance Optimization Functions

### Debounced Search (`src/hooks/useDebounce.ts`)

#### `useDebounce(value, delay)`

Debounces rapid value changes for search inputs.

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage:**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

// API call only happens after 300ms of no typing
const { data } = useGetPostsQuery({ search: debouncedSearch });
```

### Memoized Selectors

#### `useAppSelector` with Memoization

```typescript
// Memoized selector for expensive computations
const selectFilteredPosts = useMemo(
  () =>
    createSelector(
      [
        (state: RootState) => state.posts.items,
        (state: RootState) => state.ui.filters,
      ],
      (posts, filters) => {
        return posts.filter((post) => {
          if (
            filters.tags.length &&
            !filters.tags.some((tag) => post.tags.includes(tag))
          ) {
            return false;
          }
          if (
            filters.search &&
            !post.title.toLowerCase().includes(filters.search.toLowerCase())
          ) {
            return false;
          }
          return true;
        });
      }
    ),
  []
);

const filteredPosts = useAppSelector(selectFilteredPosts);
```

This documentation covers the most critical functions across the FarmConnect application, providing developers with detailed understanding of implementation patterns, usage examples, and best practices for each major functional area.
