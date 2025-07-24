import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Reply } from "../../data/posts";

interface RepliesSectionProps {
  postId: string;
  replies: Reply[];
  totalReplies: number;
  onAddReply?: (
    postId: string,
    content: string,
    parentReplyId?: string
  ) => void;
  onVoteReply?: (replyId: string, voteType: "up" | "down") => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function RepliesSection({
  postId,
  replies,
  totalReplies,
  onAddReply,
  onVoteReply,
  onLoadMore,
  hasMore = false,
}: RepliesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);
  const [localTotalReplies, setLocalTotalReplies] = useState(totalReplies);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // Track which reply is being responded to
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when props change
  React.useEffect(() => {
    setLocalReplies(replies);
    setLocalTotalReplies(totalReplies);
  }, [replies, totalReplies]);

  // Focus textarea when activeReplyId changes
  useEffect(() => {
    if (activeReplyId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeReplyId]);

  // Helper function to count total replies including nested ones
  const countAllReplies = (replies: Reply[]): number => {
    return replies.reduce((total, reply) => {
      return total + 1 + (reply.replies ? countAllReplies(reply.replies) : 0);
    }, 0);
  };

  // Calculate display logic
  const topLevelReplies = localReplies.length;
  const actualCountFromData = countAllReplies(localReplies);
  
  // Use the actual count from the data rather than the potentially stale prop
  const displayTotalCount = Math.max(actualCountFromData, localTotalReplies);
  
  // Calculate how many replies are hidden when collapsed
  const hiddenReplies = isExpanded ? 0 : countAllReplies(localReplies.slice(2));
  
  // Only show load more if we have more replies from server AND all current replies are displayed
  const showLoadMoreButton = hasMore && isExpanded && onLoadMore;
  // Show expand button if we have more than 2 top-level replies to show
  const showExpandButton = !isExpanded && topLevelReplies > 2;
  // Always show some replies initially (at least 2 or all if less than 2)
  const initialReplies = localReplies.slice(0, 2);
  
  const handleSubmitComment = useCallback(async (
    e: React.FormEvent,
    parentReplyId?: string
  ) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAddReply) {
        await onAddReply(postId, newComment.trim(), parentReplyId);

        // Optimistically update the local state
        const newReply: Reply = {
          id: `temp-${Date.now()}`,
          content: newComment.trim(),
          author: {
            id: "current-user",
            firstname: "You",
            lastname: "",
            avatar: null,
            level_id: 1,
            points: 0,
            location: "Your Location",
          },
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          replies: [],
        };

        if (parentReplyId) {
          // Add nested reply
          const updateNestedReplies = (replies: Reply[]): Reply[] => {
            return replies.map((reply) => {
              if (reply.id === parentReplyId) {
                return {
                  ...reply,
                  replies: [...(reply.replies || []), newReply],
                };
              } else if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateNestedReplies(reply.replies),
                };
              }
              return reply;
            });
          };
          setLocalReplies(updateNestedReplies(localReplies));
        } else {
          // Add top-level reply
          setLocalReplies([...localReplies, newReply]);
        }

        setLocalTotalReplies((prev) => prev + 1);
      }

      setNewComment("");
      setActiveReplyId(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, onAddReply, postId, localReplies]);

  const handleVoteReply = (replyId: string, voteType: "up" | "down") => {
    onVoteReply?.(replyId, voteType);

    // Optimistically update vote counts
    const updateVotes = (replies: Reply[]): Reply[] => {
      return replies.map((reply) => {
        if (reply.id === replyId) {
          const currentVote = reply.userVote;
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
          return {
            ...reply,
            replies: updateVotes(reply.replies),
          };
        }
        return reply;
      });
    };

    setLocalReplies(updateVotes(localReplies));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  // Recursive component for rendering nested replies
  const ReplyItem = ({
    reply,
    depth = 0,
  }: {
    reply: Reply;
    depth?: number;
  }) => {

    const marginLeft = depth * 24; // 24px per nesting level
    const maxDepth = 6; // Limit nesting depth

    return (
      <div className="space-y-3" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex gap-3">
          {/* Reply Author Avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            {reply.author.avatar ? (
              <img
                src={reply.author.avatar}
                alt={`${reply.author.firstname} ${reply.author.lastname}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs">
                {reply.author.firstname[0]}
                {reply.author.lastname[0]}
              </div>
            )}
          </Avatar>

          {/* Reply Content */}
          <div className="flex-1 min-w-0">
            {/* Reply Bubble */}
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {reply.author.firstname} {reply.author.lastname}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(reply.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {reply.content}
              </p>
            </div>

            {/* Reply Actions */}
            <div className="flex items-center gap-4 mt-2 ml-2">
              {/* Upvote */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVoteReply(reply.id, "up")}
                className={`flex items-center gap-1 p-0 h-auto text-xs ${
                  reply.userVote === "up"
                    ? "text-green-600 hover:text-green-700"
                    : "text-gray-500 hover:text-green-600"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span>{reply.upvotes}</span>
              </Button>

              {/* Downvote */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVoteReply(reply.id, "down")}
                className={`flex items-center gap-1 p-0 h-auto text-xs ${
                  reply.userVote === "down"
                    ? "text-red-600 hover:text-red-700"
                    : "text-gray-500 hover:text-red-600"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
                <span>{reply.downvotes}</span>
              </Button>

              {/* Reply Button */}
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveReplyId(reply.id);
                    // Small delay to ensure state update before focusing
                    setTimeout(() => {
                      const replyForm = document.querySelector('#main-reply-form');
                      if (replyForm) {
                        replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      // Focus the textarea after scroll
                      if (textareaRef.current) {
                        textareaRef.current.focus();
                      }
                    }, 100);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                >
                  Reply
                </Button>
              )}

              {/* More Options */}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Nested Replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="space-y-3">
            {reply.replies.map((nestedReply) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main Reply Form Component - Always visible
  const MainReplyForm = useCallback(() => (
    <div id="main-reply-form" className="flex gap-3 mt-4">
      {/* Current User Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-medium text-xs">
          YU
        </div>
      </Avatar>

      {/* Comment Input */}
      <div className="flex-1">
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <textarea
              key="main-reply-textarea" // Prevent React from recreating this element
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                activeReplyId 
                  ? `Replying to a comment...` 
                  : "Add a comment..."
              }
              className="w-full px-4 py-3 text-sm resize-none border-0 focus:ring-0 focus:outline-none min-h-[80px]"
              rows={3}
            />

            {/* Show context when replying to a specific comment */}
            {activeReplyId && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-700">
                Replying to a comment • <button 
                  onClick={() => setActiveReplyId(null)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Cancel reply
                </button>
              </div>
            )}

            {/* Comment Actions */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* You can add emoji picker or other formatting options here */}
              </div>

              <div className="flex items-center gap-2">
                {activeReplyId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveReplyId(null);
                      setNewComment("");
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  ), [newComment, activeReplyId, isSubmitting, handleSubmitComment]);

  // Show replies header if there are any replies
  if (displayTotalCount === 0) {
    return (
      <div className="mt-4 border-t border-gray-100 pt-4">
        {/* Always show reply form */}
        <MainReplyForm />
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {/* Replies Header - Only show if there are replies */}
      {displayTotalCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-0 h-auto"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">
              {displayTotalCount}{" "}
              {displayTotalCount === 1 ? "reply" : "replies"}
            </span>
            {topLevelReplies > 2 &&
              (isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              ))}
          </Button>
        </div>
      )}

      {/* Replies List - Always show initial replies */}
      <div className="space-y-4 mb-4">
        {/* Show initial replies (up to 2) */}
        {initialReplies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} depth={0} />
        ))}

        {/* Show additional replies when expanded */}
        {isExpanded && localReplies.slice(2).map((reply) => (
          <ReplyItem key={reply.id} reply={reply} depth={0} />
        ))}

        {/* Load More Replies - only show when expanded and there are more from server */}
        {showLoadMoreButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto ml-11"
          >
            Load more replies...
          </Button>
        )}
      </div>

      {/* Show More/Less Toggle for many replies */}
      {showExpandButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto mb-4"
        >
          View {hiddenReplies} more {hiddenReplies === 1 ? "reply" : "replies"}
        </Button>
      )}

      {/* Always Show Reply Form - LinkedIn Style */}
      <MainReplyForm />
    </div>
  );
}
