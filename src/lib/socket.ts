import { io, Socket } from "socket.io-client";
import { store } from "@/store";
import { discussionsApi } from "@/store/api/discussionsApi";
import { toast } from "sonner";

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io("/", {
    path: "/socket.io",
    transports: ["websocket"],
    withCredentials: true,
  });

  // Post created
  socket.on("post:create", (data: { id: string; title: string }) => {
    toast.success("New discussion posted", { description: data.title });
    // Ensure lists refresh to include new post
    store.dispatch(discussionsApi.util.invalidateTags(["Post"]));
  });

  // Post updated (e.g., moderation approve/reject)
  socket.on(
    "post:update",
    (data: { id: string; is_approved?: boolean | null }) => {
      const { is_approved } = data || {};
      if (typeof is_approved === "boolean") {
        toast.info(is_approved ? "Post approved" : "Post rejected");
      }
      // Invalidate Post caches so lists reflect changes
      store.dispatch(discussionsApi.util.invalidateTags(["Post"]));
    }
  );

  // Vote updates (delegate to cache patch helper for surgical updates)
  socket.on(
    "post:vote",
    (data: {
      postId: string;
      userId: number;
      voteType: "upvote" | "downvote" | null;
      upvotes: number;
      downvotes: number;
      userVote?: "upvote" | "downvote" | null;
      author_points?: number;
      author_points_delta?: number;
      author_level?: number;
      emitted_at?: string;
      upvoterIds?: number[];
      downvoterIds?: number[];
      diff?: {
        addedUp?: number[];
        removedUp?: number[];
        addedDown?: number[];
        removedDown?: number[];
      };
    }) => {
      import("@/store/utils/applyPostVoteWsUpdate").then(
        ({ applyPostVoteWsUpdate }) => {
          applyPostVoteWsUpdate({
            postId: data.postId,
            userId: data.userId,
            voteType: data.voteType,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            userVote: data.userVote,
            author_points: data.author_points,
            author_points_delta: data.author_points_delta,
            author_level: data.author_level,
            emitted_at: data.emitted_at,
            upvoterIds: data.upvoterIds,
            downvoterIds: data.downvoterIds,
            diff: data.diff,
          });
        }
      );
    }
  );

  socket.on("connect_error", (err: Error) => {
    console.warn("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
