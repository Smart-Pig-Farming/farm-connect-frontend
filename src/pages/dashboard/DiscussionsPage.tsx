import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { InfiniteScrollContainer } from "../../components/ui/infinite-scroll-container";
import {
  MessageSquare,
  Search,
  Users,
  Clock,
  Plus,
  Loader2,
  Settings,
  Shield,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { DiscussionCard } from "../../components/discussions/DiscussionCard";
import {
  CreatePostModal,
  EditPostModal,
  type EditPostData,
  Leaderboard,
} from "../../components/discussions";
import { type PostToEdit } from "../../components/discussions/EditPostModal";
import { ModerationDashboard } from "../../components/discussions/ModerationDashboard";
import { TagFilter } from "../../components/discussions/TagFilter";
import { mockStats, type Post } from "../../data/posts";
import { useGetMyStatsQuery } from "../../store/api/scoreApi";
import { POSTS_PER_LOAD_MORE, LOADING_DEBOUNCE_DELAY } from "../../utils/posts";
import {
  useGetPostsStatsQuery,
  useVotePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useUploadPostMediaMutation,
} from "../../store/api/discussionsApi";
import type {
  Post as ApiPost,
  PostsQueryParams,
  MyPostsQueryParams,
} from "../../store/api/discussionsApi";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useMyPostsInfiniteScroll } from "../../hooks/useMyPostsInfiniteScroll";
import { useGetMyPostsStatsQuery } from "../../store/api/discussionsApi";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { getErrorMessage, isNetworkError } from "../../utils/error";
import { getPostCoverThumbnail, getVideoThumbnail } from "../../lib/media";
import { usePermissions } from "../../hooks/usePermissions";
import { useWebSocket } from "../../hooks/useWebSocket";
import type { PostMediaLike } from "@/types/postMedia";
import { useAppDispatch } from "@/store/hooks";
import { discussionsApi } from "@/store/api/discussionsApi";

// Current user id is passed per-card when in My Posts view via each post's author.id

// Map API post to UI post shape used by DiscussionCard
const mapApiPostToUi = (p: ApiPost): Post => {
  const tagStrings = p.tags.map((t) => t.name);
  const imagesArr = p.images.map((m) => m.url);
  const videoVal = p.video ? p.video.url : null;
  const coverThumb = getPostCoverThumbnail(p);
  const videoThumbnail = getVideoThumbnail(p);
  // Normalize userVote coming from API or optimistic cache
  const apiVote = p.userVote as unknown as
    | "up"
    | "down"
    | "upvote"
    | "downvote"
    | null;
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    author: {
      id: String(p.author.id),
      firstname: p.author.firstname,
      lastname: p.author.lastname,
      avatar: p.author.avatar ?? null,
      level_id: p.author.level_id ?? 1,
      points: p.author.points ?? 0,
      location: p.author.location ?? "",
    },
    tags: tagStrings.filter(Boolean) as string[],
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    userVote:
      apiVote === "upvote" || apiVote === "up"
        ? "up"
        : apiVote === "downvote" || apiVote === "down"
        ? "down"
        : null,
    replies: p.replies,
    shares: 0,
    isMarketPost: p.isMarketPost,
    isAvailable: p.isAvailable,
    createdAt: p.createdAt,
    images: imagesArr.filter(Boolean) as string[],
    video: videoVal,
    coverThumb,
    videoThumbnail,
    isModeratorApproved: p.isModeratorApproved,
  };
};

// Custom debounce hook for better search performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function DiscussionsPage() {
  const dispatch = useAppDispatch();
  // Overlay for thumbnails coming from WebSocket events
  const [wsThumbs, setWsThumbs] = useState<
    Record<string, { coverThumb: string | null; videoThumbnail: string | null }>
  >({});
  // Local optimistic hide for deleted posts (immediate UX)
  const [clientDeleted, setClientDeleted] = useState<Record<string, boolean>>(
    {}
  );

  // Use shared PostMediaLike shape for WS payloads
  const { hasPermission } = usePermissions();
  const canModerateReports = hasPermission("MODERATE:REPORTS");
  const canModeratePosts = hasPermission("MODERATE:POSTS");
  // Daily stats (rank, points today, posts today, market opportunities) from backend
  const { data: myDailyScoreStats } = useGetMyStatsQuery({ period: "daily" });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMyPostsView, setShowMyPostsView] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [showModerationDashboard, setShowModerationDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, LOADING_DEBOUNCE_DELAY);

  // Use the new infinite scroll hook
  // Community posts feed (enabled when not in My Posts view)
  const communityFeed = useInfiniteScroll({
    search: debouncedSearchQuery || undefined,
    tag: selectedTag !== "All" ? selectedTag : undefined,
    sort: "recent",
    is_market_post: undefined,
    user_id: undefined,
    limit: POSTS_PER_LOAD_MORE,
    enabled: !showMyPostsView,
  });

  // My posts feed (enabled when My Posts view)
  const myPostsFeed = useMyPostsInfiniteScroll({
    search: debouncedSearchQuery || undefined,
    tag: selectedTag !== "All" ? selectedTag : undefined,
    sort: "recent",
    limit: POSTS_PER_LOAD_MORE,
    enabled: showMyPostsView,
  });

  // My posts stats for the sidebar header counts when in My Posts view
  const { data: myStats, error: myStatsError } = useGetMyPostsStatsQuery(
    undefined,
    { skip: !showMyPostsView }
  );

  // Toast on errors
  useEffect(() => {
    if (showMyPostsView) {
      if (myStatsError) toast.error("Failed to load your post stats");
      if (myPostsFeed.error) toast.error("Failed to load your posts");
    }
  }, [showMyPostsView, myStatsError, myPostsFeed.error]);

  // Select active feed depending on view
  const {
    posts: apiPosts,
    isLoading,
    isFetching,
    hasNextPage,
    loadMore,
    refresh,
    facets,
    error,
  } = showMyPostsView ? myPostsFeed : communityFeed;

  // Map API posts to UI posts
  const displayedPosts = useMemo(() => {
    const mapped = apiPosts
      .filter((p) => !clientDeleted[p.id])
      .map((p) => {
        const ui = mapApiPostToUi(p);
        const overlay = wsThumbs[ui.id];
        if (overlay) {
          ui.coverThumb = overlay.coverThumb ?? ui.coverThumb;
          ui.videoThumbnail = overlay.videoThumbnail ?? ui.videoThumbnail;
        }
        return ui;
      });
    console.log("🎯 DiscussionsPage mapping posts:", {
      apiPostsCount: apiPosts.length,
      mappedPostsCount: mapped.length,
      hasNextPage,
      isLoading,
      isFetching,
      error: !!error,
    });
    return mapped;
  }, [
    apiPosts,
    hasNextPage,
    isLoading,
    isFetching,
    error,
    wsThumbs,
    clientDeleted,
  ]);

  const { data: statsData } = useGetPostsStatsQuery();
  const [votePost] = useVotePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [uploadPostMedia] = useUploadPostMediaMutation();

  // Memoized query args to precisely target RTK Query caches for surgical updates
  const communityQueryArgs: PostsQueryParams = useMemo(
    () => ({
      search: debouncedSearchQuery || undefined,
      tag: selectedTag !== "All" ? selectedTag : undefined,
      sort: "recent",
      is_market_post: undefined,
      user_id: undefined,
      limit: POSTS_PER_LOAD_MORE,
      // cursor ignored by serializeQueryArgs, any value ok
      cursor: "",
    }),
    [debouncedSearchQuery, selectedTag]
  );

  const myPostsQueryArgs: MyPostsQueryParams = useMemo(
    () => ({
      search: debouncedSearchQuery || undefined,
      tag: selectedTag !== "All" ? selectedTag : undefined,
      sort: "recent",
      limit: POSTS_PER_LOAD_MORE,
      include_unapproved: true,
      cursor: "",
    }),
    [debouncedSearchQuery, selectedTag]
  );

  // Real-time updates via WebSocket: refresh feeds on server events
  useWebSocket(
    {
      onPostCreate: (data: unknown) => {
        // Compute thumbnails from WS payload when available
        const ws = data as PostMediaLike;
        const cover = getPostCoverThumbnail(ws);
        const videoTn = getVideoThumbnail(ws);
        if (cover || videoTn) {
          const id = ws?.id;
          if (id) {
            setWsThumbs((prev) => ({
              ...prev,
              [String(id)]: {
                coverThumb: cover ?? null,
                videoThumbnail: videoTn ?? null,
              },
            }));
          }
        }
        // Also refresh list for non-My Posts view to bring in the new item
        if (!showMyPostsView) refresh();
      },
      onPostUpdate: (data: unknown) => {
        const ws = data as PostMediaLike & {
          title?: string;
          content?: string;
          tags?: string[];
          is_market_post?: boolean;
        };
        const cover = getPostCoverThumbnail(ws);
        const videoTn = getVideoThumbnail(ws);
        const id = ws?.id;
        if (id && (cover || videoTn)) {
          setWsThumbs((prev) => ({
            ...prev,
            [String(id)]: {
              coverThumb: cover ?? null,
              videoThumbnail: videoTn ?? null,
            },
          }));
        }
        // Surgically patch caches for updated fields to avoid a full refetch
        if (id) {
          const patchFn = (draft: { data?: { posts?: ApiPost[] } }) => {
            const post = draft?.data?.posts?.find((p) => p.id === id);
            if (post) {
              if (ws.title !== undefined) post.title = ws.title as string;
              if (ws.content !== undefined) post.content = ws.content as string;
              if (Array.isArray(ws.tags)) {
                post.tags = (ws.tags as string[]).map((name) => ({
                  id: name,
                  name,
                  color: "gray",
                }));
              }
              const isMarket = (ws as { is_market_post?: boolean })
                .is_market_post;
              if (typeof isMarket === "boolean") post.isMarketPost = isMarket;
            }
          };
          dispatch(
            discussionsApi.util.updateQueryData(
              "getPosts",
              communityQueryArgs,
              patchFn
            )
          );
          dispatch(
            discussionsApi.util.updateQueryData(
              "getMyPosts",
              myPostsQueryArgs,
              patchFn
            )
          );
        }
      },
      onReplyCreate: () => {
        // RepliesSection handles real-time rendering within a post; counts sync on refresh.
      },
      onPostVote: (data: {
        postId: string;
        upvotes: number;
        downvotes: number;
        userVote?: "upvote" | "downvote" | null;
      }) => {
        // Surgically update vote counts from WebSocket without overriding optimistic state
        if (data?.postId) {
          const patchFn = (draft: { data?: { posts?: ApiPost[] } }) => {
            const post = draft?.data?.posts?.find((p) => p.id === data.postId);
            if (post) {
              post.upvotes = data.upvotes;
              post.downvotes = data.downvotes;
              // Only update userVote if provided (to avoid overriding optimistic state)
              if (data.userVote !== undefined) {
                post.userVote =
                  data.userVote === "upvote"
                    ? "upvote"
                    : data.userVote === "downvote"
                    ? "downvote"
                    : null;
              }
            }
          };
          dispatch(
            discussionsApi.util.updateQueryData(
              "getPosts",
              communityQueryArgs,
              patchFn
            )
          );
          dispatch(
            discussionsApi.util.updateQueryData(
              "getMyPosts",
              myPostsQueryArgs,
              patchFn
            )
          );
        }
      },
      onPostDelete: (data: { postId: string }) => {
        // When another user deletes a post, refresh the active feed
        if (data?.postId) {
          // If we wanted to be surgical, we could also prune wsThumbs here
          setWsThumbs((prev) => {
            const next = { ...prev };
            delete next[String(data.postId)];
            return next;
          });
          // Hide instantly to avoid flicker
          setClientDeleted((prev) => ({
            ...prev,
            [String(data.postId)]: true,
          }));
          refresh();
        }
      },
    },
    {
      autoConnect: true,
      serverUrl:
        (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
          ?.VITE_API_URL || "http://localhost:5000",
    }
  );

  //

  // Helper function to convert Post to PostToEdit
  const convertPostToPostToEdit = useCallback(
    (post: Post | null): PostToEdit | undefined => {
      if (!post) return undefined;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        isMarketPost: post.isMarketPost,
        isAvailable: post.isAvailable,
        images: post.images,
        video: post.video || undefined,
      };
    },
    []
  );

  // Build dynamic tag chips from backend facets
  const tagChips = useMemo(() => {
    const tags = facets?.tags ?? [];
    const totalAll = facets?.totals?.all ?? 0;
    // Map to TagFilter's expected shape and prepend All
    const chips = [
      { name: "All", count: totalAll, color: "orange" },
      ...tags.map((t) => ({
        name: t.name,
        count: t.count,
        color: String(t.color || "gray"),
      })),
    ];
    return chips;
  }, [facets]);

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  // Handle voting on a post - will use RTK Query mutation
  const handleVotePost = useCallback(
    async (postId: string, voteType: "up" | "down") => {
      try {
        await votePost({
          postId,
          vote_type: voteType === "up" ? "upvote" : "downvote",
        }).unwrap();
      } catch (error) {
        console.error("Error voting on post:", error);
        toast.error("Failed to record your vote");
      }
    },
    [votePost]
  );

  // Handle voting on a reply
  const handleVoteReply = useCallback(
    async (replyId: string, voteType: "up" | "down") => {
      try {
        console.log(`${voteType}voting reply:`, replyId);
        // In a real app, this would use the RTK Query mutation
        refresh();
      } catch (error) {
        console.error("Error voting on reply:", error);
      }
    },
    [refresh]
  );

  // Handle loading more replies for a post
  const handleLoadMoreReplies = useCallback(async (postId: string) => {
    try {
      console.log("Loading more replies for post:", postId);
      // In a real app, this would make an API call
    } catch (error) {
      console.error("Error loading more replies:", error);
    }
  }, []);

  // Handle editing a post
  const handleEditPost = useCallback(
    (postId: string) => {
      console.log("Editing post:", postId);
      const postToEdit = displayedPosts.find((post) => post.id === postId);
      if (postToEdit) {
        setEditingPost(postToEdit);
        setShowEditPost(true);
      }
    },
    [displayedPosts]
  );

  // Handle submitting edited post
  const handleEditSubmit = useCallback(
    async (editData: EditPostData) => {
      const {
        id,
        title,
        content,
        tags,
        isMarketPost,
        isAvailable,
        images,
        video,
        existingImages,
        existingVideo,
        removedVideo,
      } = editData;
      try {
        // Derive media removals. We compare the original post media urls vs existingImages/existingVideo.
        const original = displayedPosts.find((p) => p.id === id);
        const originalImageUrls = original?.images || [];
        const remainingExisting = existingImages || [];
        const removeImages = originalImageUrls.filter(
          (u) => !remainingExisting.includes(u)
        );
        const originalVideoUrl = original?.video || null;
        // Respect the modal's explicit removedVideo flag; fallback to diff-based detection
        const removeVideo =
          Boolean(removedVideo) || Boolean(originalVideoUrl && !existingVideo);

        const op = updatePost({
          id,
          data: {
            title,
            content,
            tags,
            is_market_post: isMarketPost,
            is_available: isMarketPost ? isAvailable : false,
            // Backend expects removedImages (array of URLs) and removedVideo (boolean)
            removedImages: removeImages.length ? removeImages : undefined,
            removedVideo: removeVideo || undefined,
          },
        }).unwrap();

        await toast.promise(op, {
          loading: "Saving changes...",
          success: "Post updated",
          error: "Failed to update post",
        });

        // If there are new media files, upload them
        if ((images && images.length > 0) || (video && video instanceof File)) {
          const files: File[] = [];
          if (images && images.length) files.push(...images);
          if (video && video instanceof File) files.push(video);
          if (files.length) {
            const mediaOp = uploadPostMedia({ postId: id, files }).unwrap();
            await toast.promise(mediaOp, {
              loading: "Uploading media...",
              success: "Media updated",
              error: "Failed to upload media",
            });
          }
        }

        // Refresh feeds to reflect any server-side modifications
        refresh();

        // Close modal
        setShowEditPost(false);
        setEditingPost(null);
      } catch (e) {
        console.error("Edit post failed", e);
      }
    },
    [updatePost, uploadPostMedia, refresh, displayedPosts]
  );

  // Handle deleting a post
  const handleDeleteUserPost = useCallback((postId: string) => {
    setConfirmDeleteId(postId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeleting(true);
      const op = deletePost({ id: confirmDeleteId }).unwrap();
      await toast.promise(op, {
        loading: "Deleting post...",
        success: "Post removed",
        error: "Failed to delete post",
      });
      setClientDeleted((prev) => ({ ...prev, [confirmDeleteId]: true }));
      refresh();
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deletePost, refresh]);

  return (
    <>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this post?"
        description="This will remove the post for everyone. You can’t undo this."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        loading={isDeleting}
      />
      {/* Show Moderation Dashboard if active */}
      {showModerationDashboard ? (
        <ModerationDashboard
          onBackToDiscussions={() => setShowModerationDashboard(false)}
          onViewPostDetails={(postId) => {
            // Handle post details view
            console.log("View post details:", postId);
          }}
        />
      ) : showLeaderboard ? (
        /* Show Leaderboard if active */
        <Leaderboard onBackToDiscussions={() => setShowLeaderboard(false)} />
      ) : (
        /* Main Discussions View */
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="container mx-auto max-w-6xl">
            {/* Header Section */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm w-full mb-6">
              <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 sm:gap-6">
                    {/* Title and Stats */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">
                          {showMyPostsView
                            ? "My Posts"
                            : "Community Discussions"}
                        </h1>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                          <span className="text-white/80">Total: </span>
                          <span className="text-white font-semibold">
                            {showMyPostsView
                              ? myStats?.data?.totalMyPosts ?? 0
                              : statsData?.data?.totalDiscussions ?? 0}{" "}
                            discussions
                          </span>
                        </div>
                        <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                          <span className="text-white/80">Posts today: </span>
                          <span className="text-white font-semibold">
                            {showMyPostsView
                              ? myStats?.data?.myPostsToday ?? 0
                              : statsData?.data?.postsToday ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={handleCreatePost}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start Discussion
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {/* Search Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  {/* Search with loading indicator */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    {/* Show loading indicator when search is being debounced */}
                    {searchQuery !== debouncedSearchQuery && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tag Filter */}
                <TagFilter
                  tags={tagChips}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Posts Feed - Order 2 on mobile, 1 on desktop */}
              <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                {(() => {
                  console.log("🎨 Render decision:", {
                    hasError: !!error,
                    displayedPostsCount: displayedPosts.length,
                    isLoading,
                    hasNextPage,
                    isFetching,
                  });

                  if (error) {
                    const errorMessage = getErrorMessage(error);
                    const isConnectivityIssue = isNetworkError(error);

                    return (
                      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <div className="text-red-500 mb-4">
                          <p className="text-lg font-semibold">
                            {isConnectivityIssue
                              ? "Connection issue"
                              : "Unable to load posts"}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {errorMessage}
                          </p>
                        </div>
                        <Button
                          onClick={refresh}
                          className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        >
                          {isConnectivityIssue ? "Retry" : "Try again"}
                        </Button>
                      </Card>
                    );
                  }

                  if (displayedPosts.length > 0 || isLoading) {
                    return (
                      <InfiniteScrollContainer
                        hasMore={hasNextPage}
                        loadMore={loadMore}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        className="space-y-4"
                      >
                        {displayedPosts.map((post, idx) => (
                          <DiscussionCard
                            key={`${post.id}-${post.createdAt}-${idx}`}
                            post={post}
                            onVote={handleVotePost}
                            onVoteReply={handleVoteReply}
                            onLoadMoreReplies={handleLoadMoreReplies}
                            onEditPost={
                              showMyPostsView ? handleEditPost : undefined
                            }
                            onDeletePost={
                              showMyPostsView || canModeratePosts
                                ? handleDeleteUserPost
                                : undefined
                            }
                            currentUserId={
                              showMyPostsView ? post.author.id : undefined
                            }
                          />
                        ))}
                      </InfiniteScrollContainer>
                    );
                  }

                  return (
                    <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {debouncedSearchQuery || selectedTag !== "All"
                          ? "No matches found"
                          : "No discussions yet"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {debouncedSearchQuery || selectedTag !== "All"
                          ? "Try different search terms or filters"
                          : "Start the conversation!"}
                      </p>
                      <Button
                        onClick={handleCreatePost}
                        className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {debouncedSearchQuery || selectedTag !== "All"
                          ? "New post"
                          : "Create post"}
                      </Button>
                    </Card>
                  );
                })()}
              </div>

              {/* Sidebar - Order 1 on mobile, 2 on desktop */}
              <div className="space-y-4 order-1 lg:order-2">
                {/* Community Stats */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      Stats
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">My Posts Today</span>
                        <span className="font-semibold text-orange-600">
                          {myDailyScoreStats?.postsToday ??
                            mockStats.postsToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Market Opportunities
                        </span>
                        <span className="font-semibold text-green-600">
                          {myDailyScoreStats?.marketOpportunities ??
                            mockStats.marketOpportunitiesToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points Today</span>
                        <span className="font-semibold text-blue-600">
                          +{myDailyScoreStats?.points ?? mockStats.pointsToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rank Today</span>
                        <div className="flex items-center gap-1">
                          {mockStats.rankChange === "up" && (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          )}
                          {mockStats.rankChange === "down" && (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          {mockStats.rankChange === "same" && (
                            <Minus className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="font-semibold text-purple-600">
                            #{myDailyScoreStats?.rank ?? mockStats.currentRank}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50/50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      Quick Actions
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0 p-0">
                    <div className="space-y-0">
                      <button
                        onClick={handleCreatePost}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                      >
                        <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors duration-300">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            Create Discussion
                          </span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">
                            Start a new conversation
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setShowMyPostsView(!showMyPostsView)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                      >
                        <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                          <Settings className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {showMyPostsView
                              ? "View All Discussions"
                              : "Manage My Posts"}
                          </span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">
                            {showMyPostsView
                              ? "See all community posts"
                              : "View and edit your posts"}
                          </p>
                        </div>
                      </button>
                      {canModerateReports && (
                        <button
                          onClick={() => setShowModerationDashboard(true)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                        >
                          <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors duration-300">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                              Moderate Reports
                            </span>
                            <p className="text-xs text-gray-500 group-hover:text-gray-600">
                              Review community content
                            </p>
                          </div>
                        </button>
                      )}
                      <button
                        onClick={() => setShowLeaderboard(true)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                      >
                        <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors duration-300">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            View Leaderboard
                          </span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">
                            See top contributors
                          </p>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
              isOpen={showCreatePost}
              onClose={() => setShowCreatePost(false)}
              onSuccess={() => {
                // Refresh posts list when a new post is created
                console.log("Post created successfully, refreshing list");
                refresh();
              }}
            />

            {/* Edit Post Modal */}
            <EditPostModal
              isOpen={showEditPost}
              onClose={() => {
                setShowEditPost(false);
                setEditingPost(null);
              }}
              onSubmit={handleEditSubmit}
              post={convertPostToPostToEdit(editingPost)}
            />
          </div>
        </div>
      )}
    </>
  );
}
