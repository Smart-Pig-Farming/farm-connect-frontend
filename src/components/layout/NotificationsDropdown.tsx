import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  useAppDispatch,
  useAppSelector,
  addRealtimeNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/store";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useClearAllNotificationsMutation,
  type NotificationItem,
} from "@/store/api/notificationsApi";

type IncomingNotification = {
  id?: string | number;
  title?: string;
  message?: string;
  type?:
    | "post_vote"
    | "reply_created"
    | "reply_vote"
    | "post_approved"
    | "mention"
    | "post_reported"
    | "moderation_decision_reporter"
    | "moderation_decision_owner"
    | "info";
  data?: Record<string, unknown>;
  created_at?: string;
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.notifications.items);

  // Load notifications from API
  const { data: notificationsData, refetch: refetchNotifications } =
    useGetNotificationsQuery({
      page: 1,
      limit: 50,
    });

  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [clearAllNotificationsApi] = useClearAllNotificationsMutation();

  // Use API unread count if available, otherwise fall back to Redux count
  const unread =
    unreadData?.data?.unreadCount ?? items.filter((n) => !n.read).length;

  // Merge persisted notifications with real-time ones
  const allNotifications = React.useMemo(() => {
    const persistedNotifications = notificationsData?.data?.notifications || [];
    const realtimeNotifications = items;

    // Create a map to avoid duplicates (API notifications take precedence)
    const notificationMap = new Map();

    // Add API notifications first
    persistedNotifications.forEach((notification: NotificationItem) => {
      notificationMap.set(notification.id, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
        read: notification.read,
        data: notification.data,
      });
    });

    // Add real-time notifications (only if not already in API data)
    realtimeNotifications.forEach((notification) => {
      if (!notificationMap.has(notification.id)) {
        notificationMap.set(notification.id, notification);
      }
    });

    // Sort by creation date (newest first)
    return Array.from(notificationMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notificationsData?.data?.notifications, items]);

  useWebSocket(
    {
      onNotification: (n: IncomingNotification) => {
        const id = String(n?.id ?? Date.now());
        dispatch(
          addRealtimeNotification({
            id,
            title: n?.title ?? "Notification",
            message: n?.message ?? "",
            type: n?.type ?? "info",
            createdAt: n?.created_at ?? new Date().toISOString(),
            data: n?.data ?? {},
          })
        );
      },
      onModerationDecision: (data: {
        postId: string;
        decision: "retained" | "deleted" | "warned";
        justification?: string;
        moderatorId?: string | number;
        decidedAt?: string;
        reportCount?: number;
      }) => {
        console.log(
          "🔔 NotificationsDropdown received moderation decision:",
          data
        );

        const decisionText =
          {
            retained: "✅ Content Retained",
            deleted: "🗑️ Content Deleted",
            warned: "⚠️ User Warned",
          }[data.decision] || "📝 Moderation Decision";

        const reportText = data.reportCount
          ? ` (${data.reportCount} report${data.reportCount > 1 ? "s" : ""})`
          : "";

        const message = data.justification
          ? `${decisionText}${reportText}: ${data.justification}`
          : `${decisionText}${reportText}`;

        // Add to persistent notifications
        dispatch(
          addRealtimeNotification({
            id: `moderation-${data.postId}-${Date.now()}`,
            title: "Moderation Decision Made",
            message,
            type: "moderation_decision_reporter",
            createdAt: data.decidedAt ?? new Date().toISOString(),
            data: {
              postId: data.postId,
              decision: data.decision,
              reportCount: data.reportCount,
            },
          })
        );

        // Refetch notifications to update count
        refetchNotifications();
      },
    },
    {
      autoConnect: true,
      // Ensure we connect to the backend Socket.IO server (not Vite dev origin)
      serverUrl:
        (import.meta as unknown as { env?: Record<string, string> }).env?.
          VITE_WS_URL ||
        (import.meta as unknown as { env?: Record<string, string> }).env?.
          VITE_API_URL ||
        "http://localhost:5000",
    }
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all as read in API
      await markAllAsRead().unwrap();
      // Also mark local ones as read
      dispatch(markAllNotificationsAsRead());
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Fallback to local marking only
      dispatch(markAllNotificationsAsRead());
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear all notifications via API
      await clearAllNotificationsApi().unwrap();
      // Also clear local ones
      dispatch(clearAllNotifications());
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      // Fallback to local clearing only
      dispatch(clearAllNotifications());
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-white/60 rounded-xl transition-all duration-200 relative backdrop-blur-sm group"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50">
            <span className="text-[10px] text-white font-bold">
              {unread > 99 ? "99+" : unread}
            </span>
          </span>
        )}
        <div className="absolute inset-0 rounded-xl bg-orange-500/10 scale-0 group-hover:scale-100 transition-transform duration-200" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-gray-800 text-sm">
              Notifications
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 flex items-center gap-1"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <Check className="h-3 w-3" /> Read all
              </button>
              <button
                className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-1"
                onClick={handleClearAll}
                title="Clear all"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          {allNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No notifications
            </div>
          ) : (
            <ul className="divide-y divide-gray-100/60">
              {allNotifications.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-3 hover:bg-orange-50/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                        n.read ? "bg-gray-300" : "bg-orange-500"
                      }`}
                    >
                      {n.title?.[0]?.toUpperCase() || "!"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {n.title}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.read && (
                      <span className="mt-1 h-2 w-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
