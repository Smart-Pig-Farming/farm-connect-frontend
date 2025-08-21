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
// Local Reply shape (matches API mapping subset)
export interface Reply {
  id: string;
  content: string;
  author: {
    id: string; // kept as string for UI consistency
    firstname: string;
    lastname: string;
    avatar: string | null;
    level_id: number;
    points: number;
    location: string;
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  replies?: Reply[];
}
import { toast } from "sonner";
import {
  useGetRepliesQuery,
  useAddReplyMutation,
  useVoteReplyMutation,
  type ReplyItem as ApiReply,
} from "@/store/api/discussionsApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { processScoreEvents } from "@/store/utils/scoreEventsClient";
import type { ScoreEventWs } from "@/hooks/useWebSocket";

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
}

export function RepliesSection({
  postId,
  replies,
  totalReplies,
  onVoteReply,
  onLoadMore,
}: RepliesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);
  const [localTotalReplies, setLocalTotalReplies] = useState(totalReplies);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const hasUserExpandedRef = useRef(false); // track if user explicitly expanded
  // Main (root-level) reply textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Single (root-level) reply entry only – inline form removed to avoid focus issues
  const [draftText, setDraftText] = useState("");
  const [addReply] = useAddReplyMutation();
  const [voteReply] = useVoteReplyMutation();
  const dispatch = useAppDispatch();
  const authUserId = useAppSelector((s) => s.auth.user?.id);

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

  useEffect(() => {
    if (!isExpanded || !fetched?.data?.replies) return;
    const converted = fetched.data.replies.map(mapApiReply);
    if (page === 1) {
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
          if (identical) return prev;
        }
        return merged;
      });
      const total =
        fetched.data.pagination?.total ?? dedupeById(converted).length;
      setLocalTotalReplies((prevTotal) => Math.max(total, prevTotal));
      return;
    }
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

  useEffect(() => {
    if (fetchError && isExpanded) toast.error("Failed to load replies");
  }, [fetchError, isExpanded]);

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

  // Type for WebSocket reply:create payload
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

  // Insert a created reply into local state
  const applyWsReply = useCallback(
    (payload: WsReplyPayload) => {
      if (!payload || String(payload.postId) !== String(postId)) return;
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
          if (r.replies?.length) {
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
          if (updated) return dedupeById(next);
          // Parent not yet loaded (pagination) – keep as temporary top-level with parent reference
          interface OrphanReply extends Reply {
            __parentReplyId: string;
          }
          const orphan: OrphanReply = {
            ...(wsReply as Reply),
            __parentReplyId: parentId,
          };
          return dedupeById([orphan, ...prev]);
        }
        return dedupeById([wsReply, ...prev]);
      });
      setLocalTotalReplies((n) => n + 1);
    },
    [postId, mapWsReply, dedupeById]
  );

  // Reconcile orphan replies (those with __parentReplyId) when their parent later appears
  const reconcileOrphans = useCallback((list: Reply[]): Reply[] => {
    interface OrphanReply extends Reply {
      __parentReplyId: string;
    }
    // Build id map
    const idMap = new Map<string, Reply>();
    const collect = (arr: Reply[]) => {
      arr.forEach((r) => {
        idMap.set(r.id, r);
        if (r.replies?.length) collect(r.replies);
      });
    };
    collect(list);

    const topLevel: Reply[] = [];
    let changed = false;
    const moves: { reply: OrphanReply; parent: Reply }[] = [];
    for (const r of list) {
      const parentIdMeta = (r as Partial<OrphanReply>).__parentReplyId;
      if (parentIdMeta && idMap.has(parentIdMeta)) {
        const parent = idMap.get(parentIdMeta)!;
        const alreadyNested = parent.replies?.some((c) => c.id === r.id);
        if (!alreadyNested) {
          moves.push({ reply: r as OrphanReply, parent });
          changed = true;
          continue; // skip adding to top-level; will be moved
        }
      }
      topLevel.push(r);
    }
    if (!changed) return list;
    moves.forEach(({ reply, parent }) => {
      interface Temp extends Reply {
        __parentReplyId?: string;
      }
      const clone: Temp = { ...reply };
      delete clone.__parentReplyId;
      parent.replies = parent.replies ? [...parent.replies, clone] : [clone];
    });
    return [...topLevel];
  }, []);

  useEffect(() => {
    setLocalReplies((prev) => {
      const reconciled = reconcileOrphans(prev);
      return reconciled === prev ? prev : reconciled;
    });
  }, [reconcileOrphans, localReplies]);

  // Apply socket reply:vote updates to local state
  const applyWsReplyVote = useCallback(
    (data: {
      replyId: string;
      postId: string;
      userId: number;
      voteType: "upvote" | "downvote" | null;
      upvotes: number;
      downvotes: number;
      reply_classification?: "supportive" | "contradictory" | null;
      reply_author_points?: number;
      reply_author_points_delta?: number;
      actor_points?: number;
      actor_points_delta?: number;
      trickle_roles?: {
        parent?: { userId: number; delta: number };
        grandparent?: { userId: number; delta: number };
        root?: { userId: number; delta: number };
      };
    }) => {
      if (!data || String(data.postId) !== String(postId)) return;

      // Daily points delta aggregation removed (handled by unified score:events)

      // Helper to find path to reply (array from root-level reply down to target)
      const findPath = (
        arr: Reply[],
        targetId: string,
        stack: Reply[] = []
      ): Reply[] | null => {
        for (const r of arr) {
          if (r.id === targetId) return [...stack, r];
          if (r.replies?.length) {
            const nested = findPath(r.replies, targetId, [...stack, r]);
            if (nested) return nested;
          }
        }
        return null;
      };
      const path = findPath(localReplies, data.replyId) || [];
      const classification = data.reply_classification;
      const replyDelta = data.reply_author_points_delta;
      interface ReplyWithMeta extends Reply {
        __classification?: "supportive" | "contradictory";
        __pointsFlash?: number;
      }

      // First update the voted reply (classification + its own delta)
      setLocalReplies((prev) => {
        const apply = (arr: Reply[]): Reply[] =>
          arr.map((r) => {
            if (r.id === data.replyId) {
              const userVote =
                data.voteType === "upvote"
                  ? "up"
                  : data.voteType === "downvote"
                  ? "down"
                  : null;
              const next: ReplyWithMeta = {
                ...(r as ReplyWithMeta),
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                userVote,
              };
              if (classification && !next.__classification)
                next.__classification = classification;
              if (typeof replyDelta === "number" && replyDelta !== 0)
                next.__pointsFlash = replyDelta;
              return next;
            }
            if (r.replies?.length) return { ...r, replies: apply(r.replies) };
            return r;
          });
        return apply(prev);
      });

      // Build ancestor stages for sequential cascade (parent -> grandparent -> root)
      const stages: { id: string; delta: number }[] = [];
      if (data.trickle_roles) {
        const { parent, grandparent, root } = data.trickle_roles;
        const parentReply = path.length >= 2 ? path[path.length - 2] : null;
        const grandReply = path.length >= 3 ? path[path.length - 3] : null;
        if (
          parent &&
          parentReply &&
          Number(parentReply.author.id) === Number(parent.userId)
        ) {
          stages.push({ id: parentReply.id, delta: parent.delta });
        }
        if (
          grandparent &&
          grandReply &&
          Number(grandReply.author.id) === Number(grandparent.userId)
        ) {
          stages.push({ id: grandReply.id, delta: grandparent.delta });
        }
        if (root) {
          const possibleRootReply = path.length >= 4 ? path[0] : null;
          if (
            possibleRootReply &&
            Number(possibleRootReply.author.id) === Number(root.userId)
          ) {
            stages.push({ id: possibleRootReply.id, delta: root.delta });
          }
          // If root is the post author (no reply node), would need post-level flash (future enhancement)
        }
      }

      // Apply each stage with delay for cascading visual effect
      stages.forEach((stage, idx) => {
        setTimeout(() => {
          setLocalReplies((prev) => {
            const applyStage = (arr: Reply[]): Reply[] =>
              arr.map((r) => {
                if (r.id === stage.id) {
                  const cur = r as ReplyWithMeta;
                  if (cur.__pointsFlash !== stage.delta) {
                    return { ...cur, __pointsFlash: stage.delta };
                  }
                }
                if (r.replies?.length)
                  return { ...r, replies: applyStage(r.replies) };
                return r;
              });
            return applyStage(prev);
          });
        }, 220 * (idx + 1));
      });

      // Clear flashes after overall animation window
      const totalWindow = 220 * (stages.length + 1) + 1400;
      setTimeout(() => {
        setLocalReplies((prev) => {
          const clear = (arr: Reply[]): Reply[] =>
            arr.map((r) => {
              let next = r as ReplyWithMeta;
              let changed = false;
              if (next.__pointsFlash) {
                next = { ...next, __pointsFlash: 0 };
                changed = true;
              }
              if (r.replies?.length) {
                const nested = clear(r.replies);
                if (nested !== r.replies) {
                  next = { ...next, replies: nested };
                  changed = true;
                }
              }
              return changed ? next : r;
            });
          return clear(prev);
        });
      }, totalWindow);
    },
    [postId, localReplies]
  );

  // WebSocket setup: listen to reply:create when expanded
  const serverUrl =
    (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
      ?.VITE_API_URL || "http://localhost:5000";
  interface ReplyVoteWsPayload {
    replyId: string;
    postId: string;
    userId: number;
    voteType: "upvote" | "downvote" | null;
    upvotes: number;
    downvotes: number;
    reply_classification?: "supportive" | "contradictory" | null;
    reply_author_points?: number;
    reply_author_points_delta?: number;
    trickle_roles?: {
      parent?: { userId: number; delta: number };
      grandparent?: { userId: number; delta: number };
      root?: { userId: number; delta: number };
    };
    diff?: {
      addedUp?: number[];
      removedUp?: number[];
      addedDown?: number[];
      removedDown?: number[];
    };
  }
  const wsHandlers = useMemo(
    () => ({
      onReplyCreate: (data: unknown) => {
        const payload = data as WsReplyPayload & { parentReplyId?: string };
        applyWsReply(payload);
      },
      onReplyVote: (d: ReplyVoteWsPayload) => applyWsReplyVote(d),
      onScoreEvents: ({ events }: { events: ScoreEventWs[] }) => {
        processScoreEvents(events, {
          dispatch,
          currentUserId: authUserId,
        });
      },
    }),
    [applyWsReply, applyWsReplyVote, authUserId, dispatch]
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
  // Sync incoming props cautiously to avoid disruptive resets while user viewing expanded thread
  React.useEffect(() => {
    setLocalTotalReplies(totalReplies);
    // Avoid disruptive merges while user is actively typing an inline reply
    if (activeReplyId) return;
    setLocalReplies((prev) => {
      if (!hasUserExpandedRef.current || !isExpanded) return replies;
      const existingMap = new Map(prev.map((r) => [r.id, r]));
      let changed = false;
      for (const r of replies) {
        if (!existingMap.has(r.id)) {
          prev = [...prev, r];
          changed = true;
        }
      }
      return changed ? prev : prev;
    });
  }, [replies, totalReplies, isExpanded, activeReplyId]);

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
  const actualCountFromData = countAllReplies(localReplies);
  const displayTotalCount = Math.max(actualCountFromData, localTotalReplies);
  // Collapsed view constants & derived values
  const COLLAPSED_COUNT = 2;
  const hiddenReplies = Math.max(0, displayTotalCount - COLLAPSED_COUNT);
  const visibleReplies = isExpanded
    ? localReplies
    : localReplies.slice(0, COLLAPSED_COUNT);

  // Intersection observer for auto-loading more pages when expanded & near bottom
  const loadMoreAutoRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isExpanded) return;
    const hasNext = fetched?.data?.pagination?.hasNextPage;
    if (!hasNext) return;
    const el = loadMoreAutoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetching) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "200px 0px 0px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded, fetched?.data?.pagination?.hasNextPage, isFetching]);

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
        // keep inline form visible until socket insert appears, then collapse it shortly after
        const prevActive = activeReplyId;
        if (!isExpanded) {
          setIsExpanded(true);
        }
        // Defer clearing activeReplyId to avoid focus flicker
        setTimeout(() => {
          // only clear if user hasn't started another reply
          if (activeReplyId === prevActive) setActiveReplyId(null);
        }, 250);
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
  const ReplyItem = React.memo(function ReplyItem({
    reply,
    depth = 0,
  }: {
    reply: Reply;
    depth?: number;
  }) {
    const marginLeft = depth * 24;
    const maxDepth = 3;
    type ReplyWithMeta = Reply & {
      __classification?: "supportive" | "contradictory";
      __pointsFlash?: number;
    };
    const meta = reply as ReplyWithMeta;
    const classification = meta.__classification;
    const pointsFlash = meta.__pointsFlash;

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
              <div className="flex items-center gap-2 mb-1">
                {typeof pointsFlash === "number" && pointsFlash !== 0 && (
                  <span
                    className={`text-[10px] font-semibold transition-opacity animate-pulse ${
                      pointsFlash > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pointsFlash > 0 ? "+" : ""}
                    {pointsFlash}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {reply.content}
              </p>
              {classification && (
                <div className="mt-2 flex justify-end">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium border tracking-wide ${
                      classification === "supportive"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-red-50 text-red-600 border-red-100"
                    }`}
                    title={`Semantic classification: ${classification}`}
                  >
                    {classification === "supportive" ? "Support" : "Contradict"}
                  </span>
                </div>
              )}
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
                    // Focus root textarea next frame without scrolling entire page abruptly
                    requestAnimationFrame(() => {
                      if (textareaRef.current) textareaRef.current.focus();
                    });
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

        {/* Inline form removed to prevent focus / caret issues; using single root form */}
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
  });

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
      {/* Header / Toggle */}
      {displayTotalCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-gray-800">
              {displayTotalCount}{" "}
              {displayTotalCount === 1 ? "Reply" : "Replies"}
            </span>
          </div>
          <Button
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse replies list"
                : `Expand to view all ${displayTotalCount} replies`
            }
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded((v) => {
                const next = !v;
                if (next) hasUserExpandedRef.current = true;
                return next;
              });
            }}
            className={`flex items-center gap-1 p-2 rounded-md text-xs font-medium transition-colors ${
              isExpanded
                ? "text-orange-700 bg-orange-50 hover:bg-orange-100"
                : "text-gray-600 hover:text-orange-700 hover:bg-orange-50"
            }`}
          >
            {isExpanded ? (
              <>
                Hide
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Replies list */}
      <div
        className={`relative transition-all duration-300 ${
          isExpanded ? "" : ""
        }`}
      >
        <div className="space-y-4">
          {visibleReplies.map((reply, index) => (
            <div
              key={reply.id}
              className="transform transition-all duration-300 ease-out translate-y-0 opacity-100"
              style={{ transitionDelay: `${index * 35}ms` }}
            >
              <ReplyItem reply={reply} depth={0} />
            </div>
          ))}

          {/* Inline Expand CTA (collapsed) */}
          {!isExpanded && hiddenReplies > 0 && (
            <div className="pl-11">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-md"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                View {hiddenReplies} more{" "}
                {hiddenReplies === 1 ? "reply" : "replies"}
              </Button>
            </div>
          )}

          {/* Additional replies (expanded) */}
          {isExpanded && visibleReplies.length < localReplies.length && (
            <div className="space-y-4">
              {localReplies.slice(visibleReplies.length).map((reply, index) => (
                <div
                  key={reply.id}
                  className="transform transition-all duration-300 ease-out translate-y-0 opacity-100"
                  style={{
                    transitionDelay: `${
                      (index + visibleReplies.length) * 35
                    }ms`,
                  }}
                >
                  <ReplyItem reply={reply} depth={0} />
                </div>
              ))}
            </div>
          )}

          {/* Auto load sentinel & manual load more (expanded) */}
          {isExpanded && fetched?.data?.pagination?.hasNextPage && (
            <div
              className="flex items-center gap-3 pl-11"
              ref={loadMoreAutoRef}
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={isFetching}
                onClick={() => {
                  if (!isFetching) setPage((p) => p + 1);
                  onLoadMore?.();
                }}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-md"
              >
                {isFetching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load more"
                )}
              </Button>
              <span className="text-[11px] text-gray-400">
                Auto loads when visible
              </span>
            </div>
          )}

          {/* Fetching shimmer (next pages) */}
          {isExpanded && isFetching && page > 1 && (
            <div className="pl-11 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin" />
              Loading more replies...
            </div>
          )}

          {/* Collapse CTA at bottom (only if expanded & list long) */}
          {isExpanded && displayTotalCount > COLLAPSED_COUNT && (
            <div className="pl-11 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-md"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse replies
              </Button>
            </div>
          )}
        </div>
      </div>

      {mainReplyForm}
    </div>
  );
}
