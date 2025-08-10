import React from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { InfiniteScrollContainer } from "../ui/infinite-scroll-container";
import { DiscussionCard } from "./DiscussionCard";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { MessageSquare, Plus, RefreshCw } from "lucide-react";

interface PostsListProps {
  filters?: {
    search?: string;
    tag?: string;
    sort?: "recent" | "popular" | "replies";
    is_market_post?: boolean;
    user_id?: number;
  };
  onCreatePost?: () => void;
}

export const PostsList: React.FC<PostsListProps> = ({
  filters = {},
  onCreatePost,
}) => {
  const {
    posts,
    isLoading,
    isFetching,
    hasNextPage,
    loadMore,
    refresh,
    error,
    facets,
  } = useInfiniteScroll({
    ...filters,
    limit: 10,
  });

  // Handle errors
  if (error) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Unable to load posts</p>
          <p className="text-sm">{error.toString()}</p>
        </div>
        <Button
          onClick={refresh}
          className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </Card>
    );
  }

  // Handle empty state
  if (!isLoading && posts.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {filters.search || filters.tag
            ? "No matches found"
            : "No discussions yet"}
        </h3>
        <p className="text-gray-500 mb-4">
          {filters.search || filters.tag
            ? "Try different search terms or filters"
            : "Start the conversation!"}
        </p>
        {onCreatePost && (
          <Button
            onClick={onCreatePost}
            className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create post
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Display facets if available */}
      {facets && (
        <div className="text-sm text-gray-600 mb-4">
          Total discussions: {facets.totals.all}
        </div>
      )}

      {/* Posts list with infinite scroll */}
      <InfiniteScrollContainer
        hasMore={hasNextPage}
        loadMore={loadMore}
        isLoading={isLoading}
        isFetching={isFetching}
        className="space-y-4"
      >
        {posts.map((post, index) => (
          <DiscussionCard
            key={`${post.id}-${index}`}
            post={{
              id: post.id,
              title: post.title,
              content: post.content,
              author: {
                id: String(post.author.id),
                firstname: post.author.firstname,
                lastname: post.author.lastname,
                avatar: post.author.avatar,
                level_id: post.author.level_id,
                points: post.author.points,
                location: post.author.location,
              },
              tags: post.tags.map((t) => t.name),
              upvotes: post.upvotes,
              downvotes: post.downvotes,
              userVote:
                post.userVote === "upvote"
                  ? "up"
                  : post.userVote === "downvote"
                  ? "down"
                  : null,
              replies: post.replies,
              shares: 0,
              isMarketPost: post.isMarketPost,
              isAvailable: post.isAvailable,
              createdAt: post.createdAt,
              images: post.images.map((img) => img.url),
              video: post.video?.url || null,
              isModeratorApproved: post.isModeratorApproved,
            }}
            onVote={(postId, voteType) => {
              console.log("Vote:", postId, voteType);
              // Implement voting logic
            }}
            onAddReply={(postId, content) => {
              console.log("Add reply:", postId, content);
              // Implement reply logic
            }}
            onVoteReply={(replyId, voteType) => {
              console.log("Vote reply:", replyId, voteType);
              // Implement reply voting logic
            }}
            onLoadMoreReplies={(postId) => {
              console.log("Load more replies:", postId);
              // Implement load more replies logic
            }}
          />
        ))}
      </InfiniteScrollContainer>

      {/* Manual refresh button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={refresh}
          variant="outline"
          disabled={isFetching}
          className="text-gray-600 hover:text-gray-800"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
};
