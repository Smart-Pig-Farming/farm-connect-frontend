import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  type CreatePostData,
  EditPostModal,
  type EditPostData,
} from "../../components/discussions";
import { ModerationDashboard } from "../../components/discussions/ModerationDashboard";
import { TagFilter } from "../../components/discussions/TagFilter";
import {
  allMockPosts,
  mockStats,
  availableTags,
  getCurrentUserPosts,
  getUserPostStats,
  POSTS_PER_PAGE,
  POSTS_PER_LOAD_MORE,
  LOADING_DEBOUNCE_DELAY,
  type Post,
  type Reply,
} from "../../data/posts";

// Mock current user ID - in real app this would come from auth context
const CURRENT_USER_ID = "user1"; // This matches the first author in mock data

// Time formatting function for social media style timestamps
const formatTimeAgo = (timeString: string): string => {
  // Handle relative time strings (like "2h ago", "1d ago")
  if (timeString.includes("ago")) {
    return timeString;
  }

  // For actual dates, we would parse and format them
  // This is a mock implementation for the current data structure
  const now = new Date();
  const timeValue = timeString.toLowerCase();

  if (timeValue.includes("h")) {
    const hours = parseInt(timeValue);
    if (hours < 1) return "now";
    if (hours === 1) return "1h ago";
    return `${hours}h ago`;
  }

  if (timeValue.includes("d")) {
    const days = parseInt(timeValue);
    if (days === 1) return "1d ago";
    if (days <= 6) return `${days}d ago`;

    // For posts older than 6 days, show date in dd/mm/yyyy format
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  }

  // For minute-level posts (if we had them)
  if (timeValue.includes("m") && !timeValue.includes("d")) {
    const minutes = parseInt(timeValue);
    if (minutes < 1) return "now";
    if (minutes === 1) return "1m ago";
    return `${minutes}m ago`;
  }

  return timeString;
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
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMyPostsView, setShowMyPostsView] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showModerationDashboard, setShowModerationDashboard] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, LOADING_DEBOUNCE_DELAY);

  // Get stats based on current view mode
  const currentStats = useMemo(() => {
    if (showMyPostsView) {
      return getUserPostStats(CURRENT_USER_ID);
    }
    return mockStats;
  }, [showMyPostsView]);

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredAllPosts = useMemo(() => {
    // Choose data source based on view mode
    const sourceData = showMyPostsView
      ? getCurrentUserPosts(CURRENT_USER_ID)
      : allMockPosts;

    return sourceData
      .filter((post: Post) => {
        const matchesSearch =
          post.title
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          post.content
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase());
        const matchesTag =
          selectedTag === "All" || post.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .map((post) => ({
        ...post,
        createdAt: formatTimeAgo(post.createdAt),
      }));
  }, [debouncedSearchQuery, selectedTag, showMyPostsView]);

  // Optimized load more posts function with abort controller for cancellation
  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);

    // Simulate API delay with shorter timeout for better UX
    const timeoutId = setTimeout(() => {
      if (signal.aborted) return;

      // Use POSTS_PER_LOAD_MORE (2) for subsequent loads after the initial 5
      const postsToLoad =
        currentPage === 2 ? POSTS_PER_LOAD_MORE : POSTS_PER_LOAD_MORE;
      const startIndex = displayedPosts.length; // Start from current displayed count
      const endIndex = startIndex + postsToLoad;
      const newPosts = filteredAllPosts.slice(startIndex, endIndex);

      console.log(
        `🔄 Loading posts ${startIndex + 1}-${Math.min(
          endIndex,
          filteredAllPosts.length
        )} of ${filteredAllPosts.length}`
      );

      if (newPosts.length === 0 || signal.aborted) {
        setHasMore(false);
        setIsLoading(false);
        console.log("📝 No more posts to load - infinite scroll complete!");
        return;
      }

      // Use functional update to prevent stale closure issues
      setDisplayedPosts((prev) => {
        // Prevent duplicate posts
        const existingIds = new Set(prev.map((post) => post.id));
        const uniqueNewPosts = newPosts.filter(
          (post) => !existingIds.has(post.id)
        );
        const updatedPosts = [...prev, ...uniqueNewPosts];
        console.log(
          `✅ Loaded ${uniqueNewPosts.length} new posts. Total displayed: ${updatedPosts.length}`
        );
        return updatedPosts;
      });

      setCurrentPage((prev) => prev + 1);

      // Check if we've loaded all available posts
      if (startIndex + newPosts.length >= filteredAllPosts.length) {
        setHasMore(false);
        console.log("🏁 All posts loaded!");
      }

      setIsLoading(false);
    }, 800); // Slightly longer delay to better see the loading states

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    currentPage,
    filteredAllPosts,
    isLoading,
    hasMore,
    displayedPosts.length,
  ]);

  // Reset displayed posts when filters change - optimized with debounced search
  useEffect(() => {
    // Cancel any pending loads when filters change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(false);
    // Load initial 5 posts
    const initialPosts = filteredAllPosts.slice(0, POSTS_PER_PAGE);
    setDisplayedPosts(initialPosts);
    setCurrentPage(2); // Next load will be page 2
    setHasMore(filteredAllPosts.length > POSTS_PER_PAGE);

    console.log(
      `🚀 Initial load: ${initialPosts.length} posts of ${filteredAllPosts.length} total`
    );
    if (filteredAllPosts.length > POSTS_PER_PAGE) {
      console.log(
        `⏳ ${
          filteredAllPosts.length - POSTS_PER_PAGE
        } more posts available for infinite scroll`
      );
    }
  }, [debouncedSearchQuery, selectedTag, filteredAllPosts]);

  // Optimized intersection observer for infinite scroll with better threshold
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start loading when element is 100px away
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMorePosts, hasMore, isLoading]);

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  // Handle adding a new reply to a post (for inline replies)
  const handleAddReply = useCallback(
    async (postId: string, content: string, parentReplyId?: string) => {
      try {
        // In a real app, this would make an API call
        console.log(
          "Adding reply to post:",
          postId,
          "Content:",
          content,
          "Parent:",
          parentReplyId
        );

        // Create new reply object
        const newReply: Reply = {
          id: `reply-${Date.now()}`,
          content,
          author: {
            id: "current-user",
            firstname: "Your",
            lastname: "User",
            avatar: null,
            level_id: 1,
            points: 100,
            location: "Kigali, Rwanda",
          },
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          replies: [],
        };

        // Helper function to recursively add nested reply
        const addNestedReply = (
          replies: Reply[],
          targetParentId: string,
          newReply: Reply
        ): Reply[] => {
          return replies.map((reply) => {
            if (reply.id === targetParentId) {
              // Found the parent, add the new reply to its replies array
              return {
                ...reply,
                replies: [...(reply.replies || []), newReply],
              };
            } else if (reply.replies && reply.replies.length > 0) {
              // Recursively search in nested replies
              return {
                ...reply,
                replies: addNestedReply(
                  reply.replies,
                  targetParentId,
                  newReply
                ),
              };
            }
            return reply;
          });
        };

        // Update displayed posts
        setDisplayedPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              let updatedRepliesData;

              if (parentReplyId) {
                // Adding a nested reply
                updatedRepliesData = addNestedReply(
                  post.repliesData || [],
                  parentReplyId,
                  newReply
                );
              } else {
                // Adding a top-level reply
                updatedRepliesData = [...(post.repliesData || []), newReply];
              }

              return {
                ...post,
                replies: post.replies + 1,
                repliesData: updatedRepliesData,
              };
            }
            return post;
          })
        );
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    },
    []
  );

  // Handle voting on a post
  const handleVotePost = useCallback(
    async (postId: string, voteType: "up" | "down") => {
      try {
        console.log(`${voteType}voting post:`, postId);

        // Update local state with optimistic updates
        setDisplayedPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              // Get current user vote from post data (you might want to store this separately)
              const currentVote = post.userVote || null;
              let newUpvotes = post.upvotes;
              let newDownvotes = post.downvotes;
              let newUserVote: "up" | "down" | null = voteType;

              // Handle vote logic
              if (currentVote === voteType) {
                // Remove vote
                newUserVote = null;
                if (voteType === "up") newUpvotes--;
                else newDownvotes--;
              } else {
                // Add or change vote
                if (currentVote === "up") newUpvotes--;
                else if (currentVote === "down") newDownvotes--;

                if (voteType === "up") newUpvotes++;
                else newDownvotes++;
              }

              return {
                ...post,
                upvotes: Math.max(0, newUpvotes),
                downvotes: Math.max(0, newDownvotes),
                userVote: newUserVote,
              };
            }
            return post;
          })
        );

        // In a real app, this would make an API call
        // await api.votePost(postId, voteType);
      } catch (error) {
        console.error("Error voting on post:", error);
      }
    },
    []
  );

  // Helper function to recursively update reply votes
  const updateReplyVotes = useCallback(
    (replies: Reply[], replyId: string, voteType: "up" | "down"): Reply[] => {
      return replies.map((reply) => {
        if (reply.id === replyId) {
          const currentVote = reply.userVote;
          let newUpvotes = reply.upvotes || 0;
          let newDownvotes = reply.downvotes || 0;
          let newUserVote: "up" | "down" | null = voteType;

          // Handle vote logic
          if (currentVote === voteType) {
            // Remove vote
            newUserVote = null;
            if (voteType === "up") newUpvotes--;
            else newDownvotes--;
          } else {
            // Add or change vote
            if (currentVote === "up") newUpvotes--;
            else if (currentVote === "down") newDownvotes--;

            if (voteType === "up") newUpvotes++;
            else newDownvotes++;
          }

          return {
            ...reply,
            upvotes: Math.max(0, newUpvotes),
            downvotes: Math.max(0, newDownvotes),
            userVote: newUserVote,
          };
        } else if (reply.replies && reply.replies.length > 0) {
          return {
            ...reply,
            replies: updateReplyVotes(reply.replies, replyId, voteType),
          };
        }
        return reply;
      });
    },
    []
  );

  // Handle voting on a reply
  const handleVoteReply = useCallback(
    async (replyId: string, voteType: "up" | "down") => {
      try {
        console.log(`${voteType}voting reply:`, replyId);

        // Update local state with optimistic updates
        setDisplayedPosts((prev) =>
          prev.map((post) => ({
            ...post,
            repliesData: updateReplyVotes(
              post.repliesData || [],
              replyId,
              voteType
            ),
          }))
        );

        // In a real app, this would make an API call
        // await api.voteReply(replyId, voteType);
      } catch (error) {
        console.error("Error voting on reply:", error);
      }
    },
    [updateReplyVotes]
  );

  // Handle loading more replies for a post
  const handleLoadMoreReplies = useCallback(async (postId: string) => {
    try {
      // In a real app, this would make an API call
      console.log("Loading more replies for post:", postId);

      // For now, just log the action
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
    (postId: string, editData: EditPostData) => {
      console.log("Updating post:", postId, editData);

      // Update the displayed posts with the new data
      setDisplayedPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              title: editData.title,
              content: editData.content,
              tags: editData.tags,
              isMarketPost: editData.isMarketPost,
              isAvailable: editData.isAvailable,
              // Note: In a real app, you'd handle the media files properly
              // For now, we'll keep the existing media
            };
          }
          return post;
        })
      );

      // Close the modal
      setShowEditPost(false);
      setEditingPost(null);

      // Show success message
      alert("Post updated successfully!");
    },
    []
  );

  // Handle deleting a post
  const handleDeleteUserPost = useCallback((postId: string) => {
    console.log("Deleting user's post:", postId);
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );
    if (confirmed) {
      // In a real app, this would make an API call
      console.log("Post deleted:", postId);
      // Remove from displayed posts
      setDisplayedPosts((prev) => prev.filter((post) => post.id !== postId));
    }
  }, []);

  // Memoized DiscussionCard component to prevent unnecessary re-renders
  const MemoizedDiscussionCard = useMemo(() => {
    return ({ post }: { post: Post }) => (
      <DiscussionCard
        key={post.id}
        post={post}
        onVote={handleVotePost}
        onAddReply={handleAddReply}
        onVoteReply={handleVoteReply}
        onLoadMoreReplies={handleLoadMoreReplies}
        onEditPost={showMyPostsView ? handleEditPost : undefined}
        onDeletePost={showMyPostsView ? handleDeleteUserPost : undefined}
        currentUserId={showMyPostsView ? CURRENT_USER_ID : undefined}
      />
    );
  }, [
    handleVotePost,
    handleAddReply,
    handleVoteReply,
    handleLoadMoreReplies,
    handleEditPost,
    handleDeleteUserPost,
    showMyPostsView,
  ]);

  // Enhanced loading states with progress information
  const LoadingSpinner = useMemo(
    () => (
      <div className="flex items-center justify-center gap-3 text-gray-500 py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <div className="text-center">
            <span className="text-sm font-medium block">
              Loading more discussions...
            </span>
          </div>
        </div>
      </div>
    ),
    []
  );

  const EndOfList = useMemo(
    () => (
      <div className="text-center text-gray-500 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 max-w-sm mx-auto">
          <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">
            All discussions loaded!
          </p>
        </div>
      </div>
    ),
    []
  );

  return (
    <>
      {/* Show Moderation Dashboard if active */}
      {showModerationDashboard ? (
        <ModerationDashboard
          onBackToDiscussions={() => setShowModerationDashboard(false)}
          onViewPostDetails={(postId) => {
            // Handle post details view
            console.log("View post details:", postId);
          }}
        />
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
                          <span className="text-white/80">
                            {showMyPostsView ? "Total posts: " : "Total: "}
                          </span>
                          <span className="text-white font-semibold">
                            {showMyPostsView
                              ? `${
                                  "totalPosts" in currentStats
                                    ? currentStats.totalPosts
                                    : 0
                                } posts`
                              : `${
                                  "totalDiscussions" in currentStats
                                    ? currentStats.totalDiscussions
                                    : 0
                                } discussions`}
                          </span>
                        </div>
                        <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                          <span className="text-white/80">
                            {showMyPostsView
                              ? "This week: "
                              : "Your posts today: "}
                          </span>
                          <span className="text-white font-semibold">
                            {showMyPostsView
                              ? "postsThisWeek" in currentStats
                                ? currentStats.postsThisWeek
                                : 0
                              : "postsToday" in currentStats
                              ? currentStats.postsToday
                              : 0}
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
                  tags={availableTags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Posts Feed - Order 2 on mobile, 1 on desktop */}
              <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                {displayedPosts.length > 0 ? (
                  <>
                    {/* Virtualized post rendering for better performance */}
                    <div className="space-y-4">
                      {displayedPosts.map((post) => (
                        <MemoizedDiscussionCard key={post.id} post={post} />
                      ))}
                    </div>

                    {/* Optimized loading indicator with intersection observer target */}
                    <div
                      ref={loadingRef}
                      className="flex justify-center py-4 min-h-[60px]"
                      aria-live="polite"
                      role="status"
                    >
                      {isLoading && LoadingSpinner}
                      {!hasMore && displayedPosts.length > 0 && EndOfList}
                    </div>
                  </>
                ) : (
                  <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {debouncedSearchQuery || selectedTag !== "All"
                        ? "No discussions found"
                        : "No discussions yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {debouncedSearchQuery || selectedTag !== "All"
                        ? "Try adjusting your search or filter criteria"
                        : "Be the first to start a conversation!"}
                    </p>
                    <Button
                      onClick={handleCreatePost}
                      className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {debouncedSearchQuery || selectedTag !== "All"
                        ? "Create Discussion"
                        : "Create First Post"}
                    </Button>
                  </Card>
                )}
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
                        <span className="text-gray-600">Posts Today</span>
                        <span className="font-semibold text-orange-600">
                          {mockStats.postsToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Market Opportunities
                        </span>
                        <span className="font-semibold text-green-600">
                          {mockStats.marketOpportunitiesToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points Today</span>
                        <span className="font-semibold text-blue-600">
                          +{mockStats.pointsToday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Rank</span>
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
                            #{mockStats.currentRank}
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
                      <button
                        onClick={() => setShowModerationDashboard(true)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                      >
                        <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors duration-300">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            Moderate Posts
                          </span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">
                            Review community content
                          </p>
                        </div>
                      </button>
                      <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
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
              onSubmit={(data: CreatePostData) => {
                console.log("Creating post:", data);
                setShowCreatePost(false);
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
              post={editingPost}
            />
          </div>
        </div>
      )}
    </>
  );
}
