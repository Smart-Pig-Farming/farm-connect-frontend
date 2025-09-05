import { useCallback, useMemo, useState, useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetMyPostsQuery } from "../store/api/discussionsApi";
import type { MyPostsQueryParams } from "../store/api/discussionsApi";

export interface UseMyPostsInfiniteScrollOptions {
  search?: string;
  tag?: string;
  sort?: "recent" | "popular" | "replies";
  is_market_post?: boolean;
  include_unapproved?: boolean;
  limit?: number;
  enabled?: boolean; // when false, skip fetching
}

export const useMyPostsInfiniteScroll = (
  options: UseMyPostsInfiniteScrollOptions = {}
) => {
  const [currentCursor, setCurrentCursor] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams: MyPostsQueryParams = useMemo(
    () => ({
      ...options,
      limit: options.limit || 10,
      // CRITICAL: Always include cursor parameter for cursor-based pagination
      // Empty string for first page, ISO timestamp for subsequent pages
      cursor: currentCursor,
      // Default to include unapproved posts for user's own content
      include_unapproved: options.include_unapproved ?? true,
    }),
    [options, currentCursor]
  );

  const { data, isLoading, isFetching, error, refetch } = useGetMyPostsQuery(
    options.enabled === false ? skipToken : queryParams,
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    }
  );

  // Enhanced debug logging
  console.log("🔍 useMyPostsInfiniteScroll hook state:", {
    queryParams,
    isLoading,
    isFetching,
    hasData: !!data,
    dataStructure: data
      ? {
          success: data.success,
          postsCount: data.data?.posts?.length || 0,
          paginationExists: !!data.data?.pagination,
          facetsExists: !!data.data?.facets,
        }
      : null,
    error: error
      ? {
          status: "status" in error ? error.status : "unknown",
          data: "data" in error ? error.data : "unknown",
          message: "message" in error ? error.message : "unknown",
        }
      : null,
  });

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
  console.log("📊 useMyPostsInfiniteScroll state:", {
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
    console.log("🚀 loadMore called for my posts:", {
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
      console.log("✅ Setting new cursor for my posts (ISO timestamp):", {
        nextCursor,
        isValidISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(nextCursor),
      });
      setCurrentCursor(nextCursor);
    } else {
      console.log("❌ Load more blocked for my posts:", {
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
