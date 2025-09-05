import { store } from "../index";
import { baseApi } from "../api/baseApi";
import { discussionsApi } from "../api/discussionsApi";
import type { Post } from "../api/discussionsApi";

interface PostVoteWsEvent {
  postId: string;
  userId: number;
  voteType: "upvote" | "downvote" | null;
  upvotes: number;
  downvotes: number;
  userVote?: "upvote" | "downvote" | null;
  previous_vote?: "upvote" | "downvote" | null;
  author_points?: number;
  author_points_delta?: number;
  author_level?: number;
  emitted_at?: string; // ISO timestamp (server)
  upvoterIds?: number[];
  downvoterIds?: number[];
  diff?: {
    addedUp?: number[];
    removedUp?: number[];
    addedDown?: number[];
    removedDown?: number[];
  };
}

/**
 * Apply a WebSocket post vote event to every cached getPosts / getMyPosts query regardless of filters.
 * Includes basic staleness guard using emitted_at timestamp.
 */
export function applyPostVoteWsUpdate(evt: PostVoteWsEvent) {
  const state = store.getState() as unknown as {
    auth?: { user?: { id?: number } };
    [key: string]: unknown;
  };
  const apiState = (state as Record<string, unknown>)[baseApi.reducerPath] as
    | {
        queries?: Record<string, unknown>;
      }
    | undefined;
  if (!apiState?.queries) return;

  const currentUserId = state.auth?.user?.id;

  const mutatePostsCache = (
    endpoint: "getPosts" | "getMyPosts",
    args: Record<string, unknown>
  ) => {
    store.dispatch(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      discussionsApi.util.updateQueryData(endpoint, args, (draft: any) => {
        const post: Post | undefined = draft?.data?.posts?.find(
          (p: Post) => p.id === evt.postId
        );
        if (!post) return;

        // Staleness guard: keep a last timestamp on the post object
        const lastTsKey = "__lastVoteEventAt" as const;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastTs = (post as any)[lastTsKey] as string | undefined;
        if (
          evt.emitted_at &&
          lastTs &&
          new Date(evt.emitted_at) < new Date(lastTs)
        ) {
          return; // older event
        }
        if (evt.emitted_at) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (post as any)[lastTsKey] = evt.emitted_at;
        }

        // Always trust authoritative counts
        post.upvotes = evt.upvotes;
        post.downvotes = evt.downvotes;

        // userVote is the perspective of the CURRENT viewer, so we only set it
        // when the event actor is this viewer (authoritative server-confirmed state).
        // For other users' events we leave our own vote selection untouched.
        if (evt.userVote !== undefined && evt.userId === currentUserId) {
          post.userVote =
            evt.userVote === "upvote"
              ? "up"
              : evt.userVote === "downvote"
              ? "down"
              : null;
        }

        // Author enrichment
        if (typeof evt.author_points === "number") {
          const prev = post.author.points;
          post.author.points = evt.author_points;
          if (
            typeof evt.author_points_delta === "number" &&
            evt.author_points_delta !== 0 &&
            prev !== evt.author_points
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (post as any).__lastAuthorPointsDelta = evt.author_points_delta;
          }
          if (
            typeof evt.author_level === "number" &&
            evt.author_level !== post.author.level_id
          ) {
            post.author.level_id = evt.author_level;
          }
        }

        // Incremental diff update of voter arrays (fallback to snapshot if arrays provided)
        if (Array.isArray(evt.upvoterIds)) {
          post.upvoterIds = evt.upvoterIds.slice();
        } else if (evt.diff) {
          if (!Array.isArray(post.upvoterIds)) post.upvoterIds = [];
          const setUp = new Set(post.upvoterIds);
          evt.diff.addedUp?.forEach((id) => setUp.add(id));
          evt.diff.removedUp?.forEach((id) => setUp.delete(id));
          post.upvoterIds = Array.from(setUp);
        }
        if (Array.isArray(evt.downvoterIds)) {
          post.downvoterIds = evt.downvoterIds.slice();
        } else if (evt.diff) {
          if (!Array.isArray(post.downvoterIds)) post.downvoterIds = [];
          const setDown = new Set(post.downvoterIds);
          evt.diff.addedDown?.forEach((id) => setDown.add(id));
          evt.diff.removedDown?.forEach((id) => setDown.delete(id));
          post.downvoterIds = Array.from(setDown);
        }
      })
    );
  };

  Object.keys(apiState.queries).forEach((cacheKey) => {
    if (cacheKey.startsWith("getPosts(")) {
      const json = cacheKey.slice("getPosts(".length, -1);
      let args: Record<string, unknown> = {};
      if (json) {
        try {
          args = JSON.parse(json);
        } catch {
          /* ignore */
        }
      }
      mutatePostsCache("getPosts", args);
    } else if (cacheKey.startsWith("getMyPosts(")) {
      const json = cacheKey.slice("getMyPosts(".length, -1);
      let args: Record<string, unknown> = {};
      if (json) {
        try {
          args = JSON.parse(json);
        } catch {
          /* ignore */
        }
      }
      mutatePostsCache("getMyPosts", args);
    }
  });
}
