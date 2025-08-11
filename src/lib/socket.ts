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

  // Vote updates
  socket.on("post:vote", () => {
    // Simplest: invalidate Post tag to refetch; keeps types clean
    store.dispatch(discussionsApi.util.invalidateTags(["Post"]));
  });

  socket.on("connect_error", (err: Error) => {
    console.warn("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
