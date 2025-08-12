import React, { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => void;
  isLoading?: boolean;
  isFetching?: boolean;
  loader?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const InfiniteScrollContainer: React.FC<
  InfiniteScrollContainerProps
> = ({
  children,
  hasMore,
  loadMore,
  isLoading = false,
  isFetching = false,
  loader,
  threshold = 0.1,
  rootMargin = "100px",
  className = "",
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      console.log("Intersection observer triggered:", {
        isIntersecting: entry.isIntersecting,
        hasMore,
        isFetching,
        intersectionRatio: entry.intersectionRatio,
      });

      if (entry.isIntersecting && hasMore && !isFetching) {
        console.log("Calling loadMore()");
        loadMore();
      } else {
        console.log("LoadMore blocked:", {
          isIntersecting: entry.isIntersecting,
          hasMore,
          isFetching,
        });
      }
    },
    [hasMore, isFetching, loadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, hasMore]);

  const defaultLoader = (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );

  const endMessage = (
    <div className="flex items-center justify-center py-6">
      <span className="text-sm text-gray-400">All caught up</span>
    </div>
  );

  return (
    <div className={className}>
      {children}

      {hasMore && (
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {(isFetching || isLoading) && (loader || defaultLoader)}
        </div>
      )}

      {!hasMore && !isLoading && endMessage}
    </div>
  );
};
