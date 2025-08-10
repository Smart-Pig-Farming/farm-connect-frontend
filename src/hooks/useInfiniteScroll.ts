import { useCallback, useMemo, useState, useEffect } from "react";
import { useGetPostsQuery } from "../store/api/discussionsApi";
import type { PostsQueryParams } from "../store/api/discussionsApi";

export interface UseInfiniteScrollOptions {
  search?: string;
  tag?: string;
  sort?: "recent" | "popular" | "replies";
  is_market_post?: boolean;
  user_id?: number;
  limit?: number;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions = {}) => {
  const [currentCursor, setCurrentCursor] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams: PostsQueryParams = useMemo(
    () => ({
      ...options,
      limit: options.limit || 10,
      // CRITICAL: Always include cursor parameter for cursor-based pagination
      // Empty string for first page, ISO timestamp for subsequent pages
      cursor: currentCursor,
    }),
    [options, currentCursor]
  );

  const { data, isLoading, isFetching, error, refetch } = useGetPostsQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    }
  );

  // Create a stable filter key to detect when filters change
  const filterKey = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cursor: _cursor, ...filters } = queryParams;
    return JSON.stringify(filters);
  }, [queryParams]);

  // Reset cursor when filters change
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  useEffect(() => {
    if (filterKey !== lastFilterKey) {
      setCurrentCursor("");
      setLastFilterKey(filterKey);
    }
  }, [filterKey, lastFilterKey]);

  // Get posts from RTK Query cache (already merged by the merge function)
  const posts = useMemo(() => data?.data?.posts ?? [], [data]);

  const hasNextPage = Boolean(
    data?.data?.pagination?.hasNextPage && data?.data?.pagination?.nextCursor
  );
  const nextCursor = data?.data?.pagination?.nextCursor;
  const totalCount = data?.data?.pagination?.count ?? posts.length;

  // Debug logging
  console.log("📊 useInfiniteScroll state:", {
    postsCount: posts.length,
    hasNextPage,
    nextCursor,
    currentCursor,
    totalCount,
    isLoading,
    isFetching,
    paginationData: data?.data?.pagination,
  });

  const loadMore = useCallback(() => {
    console.log("🚀 loadMore called:", {
      hasNextPage,
      isFetching,
      nextCursor,
      currentCursor,
      postsCount: posts.length,
      nextCursorType: typeof nextCursor,
      nextCursorIsISO: nextCursor
        ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(nextCursor)
        : false,
      willTrigger:
        hasNextPage &&
        !isFetching &&
        nextCursor &&
        nextCursor !== currentCursor,
    });

    if (
      hasNextPage &&
      !isFetching &&
      nextCursor &&
      nextCursor !== currentCursor
    ) {
      console.log("✅ Setting new cursor (ISO timestamp):", {
        nextCursor,
        isValidISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(nextCursor),
      });
      setCurrentCursor(nextCursor);
    } else {
      console.log("❌ Load more blocked:", {
        hasNextPage,
        isFetching,
        hasNextCursor: !!nextCursor,
        cursorChanged: nextCursor !== currentCursor,
        reasonBlocked: !hasNextPage
          ? "no more pages"
          : isFetching
          ? "already fetching"
          : !nextCursor
          ? "no next cursor"
          : nextCursor === currentCursor
          ? "cursor unchanged"
          : "unknown",
      });
    }
  }, [hasNextPage, isFetching, nextCursor, currentCursor, posts.length]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentCursor("");
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return {
    posts,
    isLoading: isLoading && !isRefreshing && posts.length === 0,
    isFetching,
    isRefreshing,
    error,
    hasNextPage,
    loadMore,
    refresh,
    totalCount,
    facets: data?.data?.facets,
  };
};
