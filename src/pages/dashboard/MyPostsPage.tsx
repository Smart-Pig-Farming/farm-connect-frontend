import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  MessageSquare,
  Search,
  Plus,
  Loader2,
  Edit,
  BarChart3,
  ThumbsUp,
} from "lucide-react";
import { CreatePostModal } from "../../components/discussions";
import { TagFilter } from "../../components/discussions/TagFilter";
import { useMyPostsInfiniteScroll } from "../../hooks/useMyPostsInfiniteScroll";
import {
  useGetTagsQuery,
  useGetMyPostsStatsQuery,
} from "../../store/api/discussionsApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toast } from "sonner";

export function MyPostsPage() {
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Infinite scroll hook with search and tag filtering
  const {
    posts,
    hasNextPage,
    loadMore,
    isLoading,
    isFetching,
    error,
    refresh,
    totalCount,
    facets,
  } = useMyPostsInfiniteScroll({
    search: searchQuery,
    tag: selectedTag !== "All" ? selectedTag : undefined,
    sort: "recent",
    limit: 10,
    enabled: true,
  });

  // Fetch My Posts stats for authenticated user
  const { data: myStats, error: statsError } = useGetMyPostsStatsQuery();

  // Toast feedback for errors
  useEffect(() => {
    if (statsError) {
      toast.error("Failed to load your post stats");
    }
    if (error) {
      const maybe = error as unknown as
        | FetchBaseQueryError
        | { message?: string };
      const status = (maybe as FetchBaseQueryError).status;
      const msg = status
        ? `Failed to load your posts (status ${String(status)})`
        : "Failed to load your posts";
      toast.error(msg);
    }
  }, [statsError, error]);

  // Get available tags
  const { data: tagsData } = useGetTagsQuery();
  const availableTags = facets?.tags
    ? [
        { name: "All", count: facets?.totals?.all ?? 0, color: "orange" },
        ...facets.tags.map((t) => ({
          name: t.name,
          count: t.count,
          color: t.color,
        })),
      ]
    : [
        { name: "All", count: 0, color: "gray" },
        ...(tagsData?.data?.tags?.map((tag) => ({
          name: tag.name,
          count: 0,
          color: tag.color,
        })) || []),
      ];

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle tag selection
  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  // Intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetching, loadMore]);

  // Handle post creation success
  const handleCreatePostSuccess = useCallback(() => {
    setShowCreatePost(false);
    toast.success("Post created successfully");
    refresh(); // Refresh the posts list
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm w-full mb-6">
          <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">
                      My Posts
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">Total: </span>
                      <span className="text-white font-semibold">
                        {myStats?.data?.totalMyPosts ?? totalCount ?? 0}{" "}
                        discussions
                      </span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">Posts today: </span>
                      <span className="text-white font-semibold">
                        {myStats?.data?.myPostsToday ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    onClick={() => setShowCreatePost(true)}
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
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search my posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <TagFilter
              tags={availableTags}
              selectedTag={selectedTag}
              onTagSelect={handleTagChange}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            {isLoading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="text-gray-600">Loading your posts...</span>
                </div>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="bg-white/80 backdrop-blur-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {post.upvotes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {post.replies}
                              </span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={observerTarget} className="h-4">
                  {isFetching && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                        <span className="text-sm text-gray-600">
                          Loading more posts...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {!hasNextPage && posts.length > 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 max-w-sm mx-auto">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600">
                        All your posts loaded!
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchQuery || selectedTag !== "All"
                    ? "No posts found"
                    : "You haven't created any posts yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedTag !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Share your farming knowledge with the community!"}
                </p>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {searchQuery || selectedTag !== "All"
                    ? "Create New Post"
                    : "Create Your First Post"}
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 order-1 lg:order-2">
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
                      {myStats?.data?.totalMyPosts ?? totalCount ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loaded Posts</span>
                    <span className="font-semibold text-blue-600">
                      {posts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold text-green-600">
                      {myStats?.data?.myPostsToday ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-semibold text-emerald-600">
                      {myStats?.data?.approvedPosts ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-amber-600">
                      {myStats?.data?.pendingPosts ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Posts</span>
                    <span className="font-semibold text-purple-600">
                      {myStats?.data?.marketPosts ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Edit className="h-4 w-4 text-orange-600" />
                  </div>
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="space-y-0">
                  <button
                    onClick={() => setShowCreatePost(true)}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSuccess={handleCreatePostSuccess}
        />
      </div>
    </div>
  );
}

export default MyPostsPage;
