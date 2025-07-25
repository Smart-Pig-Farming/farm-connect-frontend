import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  MessageSquare,
  Search,
  Clock,
  Plus,
  Loader2,
  Shield,
  Trophy,
  Edit,
  BarChart3,
} from "lucide-react";
import { DiscussionCard } from "../../components/discussions/DiscussionCard";
import {
  CreatePostModal,
  type CreatePostData,
  EditPostModal,
  type EditPostData,
} from "../../components/discussions";
import { TagFilter } from "../../components/discussions/TagFilter";
import {
  availableTags,
  POSTS_PER_PAGE,
  POSTS_PER_LOAD_MORE,
  LOADING_DEBOUNCE_DELAY,
  getCurrentUserPosts,
  getUserPostStats,
  type Post,
  type Reply,
} from "../../data/posts";

// Mock current user ID - in real app this would come from auth context
const CURRENT_USER_ID = "1"; // This matches the first author in mock data

// Time formatting function for social media style timestamps
const formatTimeAgo = (timeString: string): string => {
  // Handle relative time strings (like "2h ago", "1d ago")
  if (timeString.includes("ago")) {
    return timeString;
  }

  // For actual dates, we would parse and format them
  // This is a mock implementation for the current data structure
  const timeValue = timeString.toLowerCase();

  if (timeValue.includes("h")) {
    const hours = parseInt(timeValue);
    return `${hours}h ago`;
  }

  if (timeValue.includes("d")) {
    const days = parseInt(timeValue);
    return `${days}d ago`;
  }

  if (timeValue.includes("min")) {
    const minutes = parseInt(timeValue);
    return `${minutes}m ago`;
  }

  // Default fallback
  return timeString;
};

// Custom hook for debouncing search queries
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function MyPostsPage() {
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);

  // Pagination and loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, LOADING_DEBOUNCE_DELAY);

  // Get user's statistics
  const userStats = useMemo(() => getUserPostStats(CURRENT_USER_ID), []);

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredMyPosts = useMemo(() => {
    return getCurrentUserPosts(CURRENT_USER_ID)
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
  }, [debouncedSearchQuery, selectedTag]);

  // Initialize displayed posts on component mount and when filters change
  useEffect(() => {
    const initialPosts = filteredMyPosts.slice(0, POSTS_PER_PAGE);
    setDisplayedPosts(initialPosts);
    setCurrentPage(1);
    setHasMore(filteredMyPosts.length > POSTS_PER_PAGE);

    console.log(
      `📋 Initialized with ${initialPosts.length} of ${filteredMyPosts.length} total user posts`
    );
  }, [filteredMyPosts]);

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
      const newPosts = filteredMyPosts.slice(startIndex, endIndex);

      console.log(
        `🔄 Loading posts ${startIndex + 1}-${Math.min(
          endIndex,
          filteredMyPosts.length
        )} of ${filteredMyPosts.length}`
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
      if (startIndex + newPosts.length >= filteredMyPosts.length) {
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
    isLoading,
    hasMore,
    displayedPosts.length,
    filteredMyPosts,
    currentPage,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          console.log("🔥 Intersection detected - loading more posts...");
          loadMorePosts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [loadMorePosts, hasMore, isLoading]);

  // Handle creating a new post
  const handleCreatePost = useCallback(() => {
    setShowCreatePost(true);
    console.log("📝 Opening create post modal");
  }, []);

  // Handle updating reply votes
  const updateReplyVotes = useCallback(
    (replies: Reply[], replyId: string, voteType: "up" | "down"): Reply[] => {
      return replies.map((reply) => {
        if (reply.id === replyId) {
          const currentVote = reply.userVote || null;
          let newUpvotes = reply.upvotes;
          let newDownvotes = reply.downvotes;
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
          // Recursively update nested replies
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

  // Handle adding a reply to a post
  const handleAddReply = useCallback(
    async (postId: string, content: string, parentReplyId?: string) => {
      try {
        console.log("Adding reply to post:", postId, { content, parentReplyId });

        // Generate a new reply ID
        const newReplyId = `reply_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create the new reply object with mock user data
        const newReply: Reply = {
          id: newReplyId,
          content,
          author: {
            id: CURRENT_USER_ID,
            firstname: "Current",
            lastname: "User",
            avatar: null,
            level_id: 2,
            points: 150,
            location: "Kigali, Rwanda",
          },
          createdAt: "Just now",
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          replies: [],
        };

        // Helper function to add nested replies
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
  const handleEditPost = useCallback((postId: string) => {
    console.log("Editing post:", postId);
    const postToEdit = displayedPosts.find(post => post.id === postId);
    if (postToEdit) {
      setEditingPost(postToEdit);
      setShowEditPost(true);
    }
  }, [displayedPosts]);

  // Handle submitting edited post
  const handleEditSubmit = useCallback((postId: string, editData: EditPostData) => {
    console.log("Updating post:", postId, editData);
    
    // Update the displayed posts with the new data
    setDisplayedPosts(prev => prev.map(post => {
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
    }));
    
    // Close the modal
    setShowEditPost(false);
    setEditingPost(null);
    
    // Show success message
    alert("Post updated successfully!");
  }, []);

  // Handle deleting a post
  const handleDeleteUserPost = useCallback((postId: string) => {
    console.log("Deleting user's post:", postId);
    // TODO: Implement delete functionality
    // Show confirmation dialog, then delete post
    const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
    if (confirmed) {
      // In a real app, this would make an API call
      console.log("Post deleted:", postId);
      // Remove from displayed posts
      setDisplayedPosts(prev => prev.filter(post => post.id !== postId));
    }
  }, []);

  // Navigate back to all discussions
  const handleViewAllDiscussions = useCallback(() => {
    // In a real app, this would navigate to the discussions page
    console.log("Navigating to all discussions...");
    // Example: navigate('/dashboard/discussions');
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
        onEditPost={handleEditPost}
        onDeletePost={handleDeleteUserPost}
        currentUserId={CURRENT_USER_ID}
      />
    );
  }, [handleVotePost, handleAddReply, handleVoteReply, handleLoadMoreReplies, handleEditPost, handleDeleteUserPost]);

  // Enhanced loading states with progress information
  const LoadingSpinner = useMemo(
    () => (
      <div className="flex items-center justify-center gap-3 text-gray-500 py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <div className="text-center">
            <span className="text-sm font-medium block">
              Loading more posts...
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
            All your posts loaded!
          </p>
        </div>
      </div>
    ),
    []
  );

  return (
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
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">
                      My Posts
                    </h1>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">Total: </span>
                      <span className="text-white font-semibold">
                        {userStats.totalPosts} posts
                      </span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">This week: </span>
                      <span className="text-white font-semibold">
                        {userStats.postsThisWeek}
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
                    Create New Post
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
                  placeholder="Search my posts..."
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
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "No posts found"
                    : "You haven't created any posts yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Share your farming knowledge with the community!"}
                </p>
                <Button
                  onClick={handleCreatePost}
                  className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "Create New Post"
                    : "Create Your First Post"}
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar - Order 1 on mobile, 2 on desktop */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* My Posts Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  My Stats
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-semibold text-orange-600">
                      {userStats.totalPosts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-green-600">
                      {userStats.totalViews}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Replies</span>
                    <span className="font-semibold text-blue-600">
                      {userStats.totalReplies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Upvotes</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-purple-600">
                        {userStats.totalUpvotes}
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
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                  >
                    <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors duration-300">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Create New Post
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        Share your knowledge
                      </p>
                    </div>
                  </button>
                  <button 
                    onClick={handleViewAllDiscussions}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                  >
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        View All Discussions
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        Browse community posts
                      </p>
                    </div>
                  </button>
                  <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
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
                  <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
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
  );
}
