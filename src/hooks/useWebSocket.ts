import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// Event interfaces matching backend
interface PostCreateData {
  id: string;
  title: string;
  content: string;
  author: {
    id: number;
    firstname: string;
    lastname: string;
  };
  tags: string[];
  is_market_post: boolean;
  upvotes: number;
  downvotes: number;
  replies_count: number;
  created_at: string;
}

interface PostVoteData {
  postId: string;
  userId: number;
  voteType: "upvote" | "downvote" | null;
  upvotes: number;
  downvotes: number;
}

interface ReplyCreateData {
  id: string;
  content: string;
  postId: string;
  parentReplyId?: string;
  author: {
    id: number;
    firstname: string;
    lastname: string;
  };
  upvotes: number;
  downvotes: number;
  depth: number;
  created_at: string;
}

interface ReplyVoteData {
  replyId: string;
  postId: string;
  userId: number;
  voteType: "upvote" | "downvote" | null;
  upvotes: number;
  downvotes: number;
}

// Generic moderation event payloads
interface ModerationReportedData {
  id: string;
}

interface ModerationApprovalData {
  contentId: string;
}

interface NotificationData {
  id: string;
  userId: number;
  type:
    | "post_vote"
    | "reply_created"
    | "reply_vote"
    | "post_approved"
    | "mention"
    | "post_reported";
  title: string;
  message: string;
  data: Record<string, unknown>;
  created_at: string;
}

interface UserActivity {
  userId: number;
  socketId?: string;
}

interface TypingData {
  userId: number;
  postId: string;
  isTyping: boolean;
}

// Event handlers interface
interface WebSocketEventHandlers {
  onPostCreate?: (data: PostCreateData) => void;
  onPostUpdate?: (data: unknown) => void;
  onPostDelete?: (data: { postId: string }) => void;
  onPostVote?: (data: PostVoteData) => void;
  onReplyCreate?: (data: ReplyCreateData) => void;
  onReplyUpdate?: (data: unknown) => void;
  onReplyDelete?: (data: { replyId: string; postId: string }) => void;
  onReplyVote?: (data: ReplyVoteData) => void;
  onUserOnline?: (data: UserActivity) => void;
  onUserOffline?: (data: UserActivity) => void;
  onUserTyping?: (data: TypingData) => void;
  onNotification?: (data: NotificationData) => void;
  onModerationReport?: (data: unknown) => void;
  onModerationApproval?: (data: unknown) => void;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  authToken?: string;
  serverUrl?: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  // Discussion room methods
  joinDiscussion: (postId: string) => void;
  leaveDiscussion: (postId: string) => void;
  // Typing indicators
  startTyping: (postId: string) => void;
  stopTyping: (postId: string) => void;
  // Vote acknowledgment
  castVote: (
    contentId: string,
    contentType: "post" | "reply",
    voteType: "upvote" | "downvote" | null
  ) => void;
  // Connection status
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  error: string | null;
}

export const useWebSocket = (
  handlers: WebSocketEventHandlers = {},
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    autoConnect = true,
    authToken,
    serverUrl = process.env.REACT_APP_API_URL || "http://localhost:5000",
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update handlers ref when handlers change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("📡 WebSocket already connected");
      return;
    }

    setConnectionStatus("connecting");
    setError(null);

    console.log("🔌 Connecting to WebSocket server...", {
      serverUrl,
      hasToken: !!authToken,
    });

    socketRef.current = io(serverUrl, {
      auth: {
        token: authToken,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server:", socket.id);
      setIsConnected(true);
      setConnectionStatus("connected");
      setError(null);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Disconnected from WebSocket server:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (err: Error) => {
      console.error("🚨 WebSocket connection error:", err.message);
      setConnectionStatus("error");
      setError(err.message);
      setIsConnected(false);
    });

    // Discussion events
    socket.on("post:create", (data: PostCreateData) => {
      console.log("📝 New post created:", data.id);
      handlersRef.current.onPostCreate?.(data);
    });

    socket.on("post:update", (data: PostCreateData | { id?: string }) => {
      const d = data as { id?: string };
      console.log("✏️ Post updated:", d?.id ?? "<unknown>");
      handlersRef.current.onPostUpdate?.(data as PostCreateData);
    });

    socket.on("post:delete", (data: { postId: string }) => {
      console.log("🗑️ Post deleted:", data.postId);
      handlersRef.current.onPostDelete?.(data);
    });

    socket.on("post:vote", (data: PostVoteData) => {
      console.log("👍 Post vote update:", data.postId, data.voteType);
      handlersRef.current.onPostVote?.(data);
    });

    socket.on("reply:create", (data: ReplyCreateData) => {
      console.log("💬 New reply created:", data.id, "on post", data.postId);
      handlersRef.current.onReplyCreate?.(data);
    });

    socket.on("reply:update", (data: ReplyCreateData | { id?: string }) => {
      const d = data as { id?: string };
      console.log("✏️ Reply updated:", d?.id ?? "<unknown>");
      handlersRef.current.onReplyUpdate?.(data as ReplyCreateData);
    });

    socket.on("reply:delete", (data: { replyId: string; postId: string }) => {
      console.log("🗑️ Reply deleted:", data.replyId);
      handlersRef.current.onReplyDelete?.(data);
    });

    socket.on("reply:vote", (data: ReplyVoteData) => {
      console.log("👍 Reply vote update:", data.replyId, data.voteType);
      handlersRef.current.onReplyVote?.(data);
    });

    // User activity events
    socket.on("user:online", (data: UserActivity) => {
      console.log("🟢 User online:", data.userId);
      handlersRef.current.onUserOnline?.(data);
    });

    socket.on("user:offline", (data: UserActivity) => {
      console.log("🔴 User offline:", data.userId);
      handlersRef.current.onUserOffline?.(data);
    });

    socket.on("user:typing", (data: TypingData) => {
      console.log(
        "⌨️ User typing:",
        data.userId,
        "in post",
        data.postId,
        data.isTyping
      );
      handlersRef.current.onUserTyping?.(data);
    });

    // Notification events
    socket.on("notification:new", (data: NotificationData) => {
      console.log("🔔 New notification:", data.title);
      handlersRef.current.onNotification?.(data);
    });

    // Moderation events
    socket.on("moderation:content_reported", (data: ModerationReportedData | { id?: string }) => {
      const d = data as { id?: string };
      console.log("🚨 Content reported:", d?.id ?? "<unknown>");
      handlersRef.current.onModerationReport?.(data as ModerationReportedData);
    });

    socket.on("moderation:content_approved", (data: ModerationApprovalData | { contentId?: string }) => {
      const d = data as { contentId?: string };
      console.log("✅ Content approved:", d?.contentId ?? "<unknown>");
      handlersRef.current.onModerationApproval?.(data as ModerationApprovalData);
    });

    socket.on("moderation:content_rejected", (data: ModerationApprovalData | { contentId?: string }) => {
      const d = data as { contentId?: string };
      console.log("❌ Content rejected:", d?.contentId ?? "<unknown>");
      handlersRef.current.onModerationApproval?.(data as ModerationApprovalData);
    });

    // Vote acknowledgment
    socket.on("vote:acknowledged", (data: { contentId: string }) => {
      console.log("✅ Vote acknowledged:", data.contentId);
    });

    socket.connect();
  }, [serverUrl, authToken]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting from WebSocket server...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");

      // Clear any typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    }
  }, []);

  // Discussion room management
  const joinDiscussion = useCallback((postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("discussion:join", { postId });
      console.log("👀 Joined discussion:", postId);
    }
  }, []);

  const leaveDiscussion = useCallback((postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("discussion:leave", { postId });
      console.log("👋 Left discussion:", postId);
    }
  }, []);

  const stopTyping = useCallback((postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:stop", { postId });

      // Clear timeout
      const timeout = typingTimeoutsRef.current.get(postId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutsRef.current.delete(postId);
      }
    }
  }, []);

  // Typing indicators with auto-stop
  const startTyping = useCallback(
    (postId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("typing:start", { postId });

        // Clear existing timeout for this post
        const existingTimeout = typingTimeoutsRef.current.get(postId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Auto-stop typing after 3 seconds of inactivity
        const timeout = setTimeout(() => {
          stopTyping(postId);
        }, 3000);

        typingTimeoutsRef.current.set(postId, timeout);
      }
    },
    [stopTyping]
  );

  // Vote casting with acknowledgment
  const castVote = useCallback(
    (
      contentId: string,
      contentType: "post" | "reply",
      voteType: "upvote" | "downvote" | null
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("vote:cast", {
          contentId,
          contentType,
          voteType,
        });
        console.log("🗳️ Vote cast:", contentId, voteType);
      }
    },
    []
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    const timeoutsMap = typingTimeoutsRef.current;
    return () => {
      // Clear all typing timeouts
      timeoutsMap.forEach((timeout) => clearTimeout(timeout));
      timeoutsMap.clear();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinDiscussion,
    leaveDiscussion,
    startTyping,
    stopTyping,
    castVote,
    connectionStatus,
    error,
  };
};

export default useWebSocket;
