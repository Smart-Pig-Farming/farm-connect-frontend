import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
import { toast } from "sonner";
import {
  useGetRepliesQuery,
  useAddReplyMutation,
  useVoteReplyMutation,
  type ReplyItem as ApiReply,
} from "@/store/api/discussionsApi";
import { useWebSocket } from "@/hooks/useWebSocket";

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
  // onAddReply is now handled internally via API
  onVoteReply,
  onLoadMore,
  hasMore = false,
}: RepliesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);
  const [localTotalReplies, setLocalTotalReplies] = useState(totalReplies);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draftText, setDraftText] = useState("");
  const [addReply] = useAddReplyMutation();
  const [voteReply] = useVoteReplyMutation();

  const {
    data: fetched,
    error: fetchError,
    isFetching,
    isUninitialized,
    refetch,
  } = useGetRepliesQuery({ postId, page, limit }, { skip: !isExpanded });

  const dedupeById = useCallback((arr: Reply[]) => {
    const seen = new Set<string>();
    const out: Reply[] = [];
    for (const r of arr) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        out.push(r);
      }
    }
    return out;
  }, []);

  // Normalize API replies into UI Reply type
  const mapApiReply = useCallback((r: ApiReply): Reply => {
    const child = (r.childReplies || []).map(mapApiReply);
    const userVote: "up" | "down" | null =
      r.userVote === "up" ? "up" : r.userVote === "down" ? "down" : null;
    return {
      id: String(r.id),
      content: r.content,
      author: {
        id: String(r.author.id),
        firstname: r.author.firstname,
        lastname: r.author.lastname,
        avatar: r.author.avatar ?? null,
        level_id: 1,
        points: 0,
        location: "",
      },
      createdAt: r.createdAt,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      userVote,
      replies: child,
    };
  }, []);

  // Merge fetched page into localReplies
  useEffect(() => {
    if (!isExpanded || !fetched?.data?.replies) return;
    const converted = fetched.data.replies.map(mapApiReply);

    // For page 1, always merge fresh data so new replies from refetch appear immediately
    if (page === 1) {
      // Backend sorts newest first, so prefer API order first
      setLocalReplies((prev) => {
        const merged = dedupeById([...converted, ...prev]);
        if (merged.length === prev.length) {
          let identical = true;
          for (let i = 0; i < merged.length; i++) {
            if (merged[i].id !== prev[i].id) {
              identical = false;
              break;
            }
          }
          if (identical) return prev; // no real change
        }
        return merged;
      });
      const total =
        fetched.data.pagination?.total ?? dedupeById(converted).length;
      setLocalTotalReplies((prevTotal) => Math.max(total, prevTotal));
      // Do NOT mutate loadedPages for page 1 to keep this merge idempotent
      return;
    }

    // For subsequent pages, avoid re-merging the same page repeatedly
    if (loadedPages.has(page)) return;
    setLocalReplies((prev) => dedupeById([...prev, ...converted]));
    const total =
      fetched.data.pagination?.total ?? dedupeById(converted).length;
    setLocalTotalReplies((prevTotal) => Math.max(prevTotal, total));
    setLoadedPages((s) => {
      if (s.has(page)) return s;
      const next = new Set(s);
      next.add(page);
      return next;
    });
  }, [fetched, isExpanded, page, loadedPages, mapApiReply, dedupeById]);

  // Show errors
  useEffect(() => {
    if (fetchError && isExpanded) {
      toast.error("Failed to load replies");
    }
  }, [fetchError, isExpanded]);

  // Map WS reply payload to UI Reply
  const mapWsReply = useCallback(
    (d: {
      id: string | number;
      content: string;
      postId: string | number;
      parentReplyId?: string | number;
      author: { id: number; firstname: string; lastname: string };
      upvotes: number;
      downvotes: number;
      depth: number;
      created_at: string;
    }): Reply => ({
      id: String(d.id),
      content: d.content,
      author: {
        id: String(d.author.id),
        firstname: d.author.firstname,
        lastname: d.author.lastname,
        avatar: null,
        level_id: 1,
        points: 0,
        location: "",
      },
      createdAt: d.created_at,
      upvotes: d.upvotes ?? 0,
      downvotes: d.downvotes ?? 0,
      userVote: null,
      replies: [],
    }),
    []
  );

  // Insert WS reply into local state
  type WsReplyPayload = {
    id: string | number;
    content: string;
    postId: string | number;
    parentReplyId?: string | number;
    author: { id: number; firstname: string; lastname: string };
    upvotes: number;
    downvotes: number;
    depth: number;
    created_at: string;
  };

  const applyWsReply = useCallback(
    (payload: WsReplyPayload) => {
      if (!payload) return;
      if (String(payload.postId) !== String(postId)) return;
      const wsReply = mapWsReply(payload);
      const parentId = payload?.parentReplyId
        ? String(payload.parentReplyId)
        : null;
      const depth = Number(payload?.depth ?? 1);
      if (depth > 3) return;

      const insertChild = (
        arr: Reply[]
      ): { updated: boolean; next: Reply[] } => {
        let didUpdate = false;
        const next = arr.map((r) => {
          if (r.id === parentId) {
            didUpdate = true;
            const children = r.replies ? [...r.replies, wsReply] : [wsReply];
            return { ...r, replies: children };
          }
          if (r.replies && r.replies.length) {
            const nested = insertChild(r.replies);
            if (nested.updated) {
              didUpdate = true;
              return { ...r, replies: nested.next };
            }
          }
          return r;
        });
        return { updated: didUpdate, next };
      };

      setLocalReplies((prev) => {
        if (parentId) {
          const { updated, next } = insertChild(prev);
          // If parent not found (due to pagination), prepend top-level as fallback
          return updated ? dedupeById(next) : dedupeById([wsReply, ...prev]);
        }
        // Top-level reply: prepend
        return dedupeById([wsReply, ...prev]);
      });
      setLocalTotalReplies((n) => n + 1);
    },
    [postId, mapWsReply, dedupeById]
  );

  // Apply socket reply:vote updates to local state
  const applyWsReplyVote = useCallback(
    (data: {
      replyId: string;
      postId: string;
      userId: number;
      voteType: "upvote" | "downvote" | null;
      upvotes: number;
      downvotes: number;
    }) => {
      if (!data || String(data.postId) !== String(postId)) return;
      const update = (arr: Reply[]): Reply[] =>
        arr.map((r) => {
          if (r.id === data.replyId) {
            // best-effort set counts; userVote is derived from server type
            const userVote =
              data.voteType === "upvote"
                ? "up"
                : data.voteType === "downvote"
                ? "down"
                : null;
            return {
              ...r,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
              userVote,
            };
          }
          if (r.replies?.length) return { ...r, replies: update(r.replies) };
          return r;
        });
      setLocalReplies((prev) => update(prev));
    },
    [postId]
  );

  // WebSocket setup: listen to reply:create when expanded
  const serverUrl =
    (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
      ?.VITE_API_URL || "http://localhost:5000";
  const wsHandlers = useMemo(
    () => ({
      onReplyCreate: (data: unknown) => applyWsReply(data as WsReplyPayload),
      onReplyVote: (d: {
        replyId: string;
        postId: string;
        userId: number;
        voteType: "upvote" | "downvote" | null;
        upvotes: number;
        downvotes: number;
      }) => applyWsReplyVote(d),
    }),
    [applyWsReply, applyWsReplyVote]
  );

  const ws = useWebSocket(wsHandlers, { autoConnect: isExpanded, serverUrl });

  // Join/leave discussion room based on expansion
  const { isConnected, joinDiscussion, leaveDiscussion } = ws || {};
  useEffect(() => {
    if (!isExpanded || !isConnected) return;
    joinDiscussion?.(postId);
    return () => leaveDiscussion?.(postId);
  }, [isExpanded, isConnected, joinDiscussion, leaveDiscussion, postId]);

  // On reconnect, refetch replies to resync
  const lastRefetchAt = useRef(0);
  useEffect(() => {
    if (isExpanded && ws.connectionStatus === "connected") {
      const now = Date.now();
      if (now - lastRefetchAt.current > 3000) {
        refetch();
        lastRefetchAt.current = now;
      }
    }
  }, [ws.connectionStatus, isExpanded, refetch]);

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
  const displayTotalCount = Math.max(actualCountFromData, localTotalReplies);
  const hiddenReplies = isExpanded ? 0 : countAllReplies(localReplies.slice(2));
  const showLoadMoreButton = hasMore && isExpanded && onLoadMore;
  const showExpandButton = !isExpanded && topLevelReplies > 2;
  const initialReplies = localReplies.slice(0, 2);

  // Main submit handler
  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      const commentText = draftText;
      if (!commentText || commentText.trim().length === 0) {
        toast.error("Please enter a reply");
        return;
      }

      setIsSubmitting(true);
      try {
        const op = addReply({
          postId,
          content: commentText.trim(),
          parent_reply_id: activeReplyId ? String(activeReplyId) : undefined,
        }).unwrap();
        await toast.promise(op, {
          loading: "Posting reply...",
          success: "Reply posted",
          error: (e) =>
            typeof e?.data?.message === "string"
              ? e.data.message
              : "Failed to post reply",
        });
        setDraftText("");
        setActiveReplyId(null);
        // Ensure list is visible so socket + fetch can render the new reply
        if (!isExpanded) {
          setIsExpanded(true);
        }
        // Only refetch if the query has already been started
        if (!isUninitialized) {
          refetch();
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      addReply,
      postId,
      activeReplyId,
      refetch,
      isExpanded,
      isUninitialized,
      draftText,
    ]
  );

  const handleVoteReply = async (replyId: string, voteType: "up" | "down") => {
    // Optimistic UI: mirror toggling logic locally
    setLocalReplies((prev) => {
      const update = (arr: Reply[]): Reply[] =>
        arr.map((r) => {
          if (r.id === replyId) {
            const current = r.userVote;
            let up = r.upvotes;
            let down = r.downvotes;
            let next: "up" | "down" | null = voteType;
            if (current === voteType) {
              // toggle off
              next = null;
              if (voteType === "up") up = Math.max(0, up - 1);
              else down = Math.max(0, down - 1);
            } else {
              if (current === "up") up = Math.max(0, up - 1);
              if (current === "down") down = Math.max(0, down - 1);
              if (voteType === "up") up += 1;
              else down += 1;
            }
            return { ...r, upvotes: up, downvotes: down, userVote: next };
          }
          if (r.replies?.length) return { ...r, replies: update(r.replies) };
          return r;
        });
      return update(prev);
    });

    try {
      const serverType = voteType === "up" ? "upvote" : "downvote";
      await voteReply({ replyId, vote_type: serverType, postId }).unwrap();
    } catch {
      // If server rejects, refetch to reconcile
      refetch();
      toast.error("Failed to vote on reply");
    }
    onVoteReply?.(replyId, voteType);
  };

  // Helper function to find a reply by ID
  const findReplyById = useCallback(
    (replies: Reply[], replyId: string): Reply | null => {
      for (const reply of replies) {
        if (reply.id === replyId) {
          return reply;
        }
        if (reply.replies && reply.replies.length > 0) {
          const found = findReplyById(reply.replies, replyId);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  const replyContext = activeReplyId
    ? findReplyById(localReplies, activeReplyId)
    : null;

  const formatTimeAgo = (dateString: string) => {
    if (
      dateString.includes("ago") ||
      dateString.includes("s") ||
      dateString.includes("m") ||
      dateString.includes("h") ||
      dateString.includes("d") ||
      dateString.includes("w")
    ) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      const now = new Date();

      if (isNaN(date.getTime())) {
        return dateString;
      }

      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return `${Math.floor(diffInSeconds / 604800)}w ago`;
    } catch {
      return dateString;
    }
  };

  // Recursive component for rendering nested replies
  const ReplyItem = ({
    reply,
    depth = 0,
  }: {
    reply: Reply;
    depth?: number;
  }) => {
    const marginLeft = depth * 24;
    const maxDepth = 3;

    return (
      <div className="space-y-3" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex gap-3">
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

          <div className="flex-1 min-w-0">
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

            <div className="flex items-center gap-4 mt-2 ml-2">
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

              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveReplyId(reply.id);
                    setDraftText("");
                    setTimeout(() => {
                      const replyForm =
                        document.querySelector("#main-reply-form");
                      if (replyForm) {
                        replyForm.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
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

  // Main Reply Form Component
  const mainReplyForm = useMemo(
    () => (
      <div id="main-reply-form" className="flex gap-3 mt-4">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-medium text-xs">
            YU
          </div>
        </Avatar>

        <div className="flex-1">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <textarea
                ref={textareaRef}
                placeholder={
                  activeReplyId
                    ? `Replying to ${
                        replyContext?.author.firstname || "a comment"
                      }...`
                    : "Add a comment..."
                }
                className="w-full px-4 py-3 text-sm resize-none border-0 focus:ring-0 focus:outline-none min-h-[80px]"
                rows={3}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />

              {activeReplyId && replyContext && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-700">
                  Replying to {replyContext.author.firstname}: "
                  {replyContext.content.slice(0, 50)}
                  {replyContext.content.length > 50 ? "..." : ""}" •{" "}
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(null)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Cancel reply
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2"></div>

                <div className="flex items-center gap-2">
                  {activeReplyId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReplyId(null)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
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
    ),
    [activeReplyId, isSubmitting, handleSubmitComment, replyContext, draftText]
  );

  if (displayTotalCount === 0) {
    return (
      <div className="mt-4 border-t border-gray-100 pt-4">{mainReplyForm}</div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
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

      <div className="space-y-4 mb-4">
        {initialReplies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} depth={0} />
        ))}

        {isExpanded &&
          localReplies
            .slice(2)
            .map((reply) => (
              <ReplyItem key={reply.id} reply={reply} depth={0} />
            ))}

        {(showLoadMoreButton ||
          (isExpanded && fetched?.data?.pagination?.hasNextPage)) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (fetched?.data?.pagination?.hasNextPage) setPage((p) => p + 1);
              onLoadMore?.();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto ml-11"
          >
            {isFetching ? "Loading..." : "Load more replies..."}
          </Button>
        )}
      </div>

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

      {mainReplyForm}
    </div>
  );
}
