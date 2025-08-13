import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  useAppDispatch,
  useAppSelector,
  addRealtimeNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/store";

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
  const unread = items.filter((n) => !n.read).length;

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
    },
    { autoConnect: true }
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

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
                onClick={() => dispatch(markAllNotificationsAsRead())}
                title="Mark all as read"
              >
                <Check className="h-3 w-3" /> Read all
              </button>
              <button
                className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-1"
                onClick={() => dispatch(clearAllNotifications())}
                title="Clear all"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No notifications
            </div>
          ) : (
            <ul className="divide-y divide-gray-100/60">
              {items.map((n) => (
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
