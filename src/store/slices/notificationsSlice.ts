import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type:
    | "post_vote"
    | "reply_created"
    | "reply_vote"
    | "post_approved"
    | "mention"
    | "post_reported"
    | "moderation_decision_reporter"
    | "moderation_decision_owner"
    | "info";
  createdAt: string;
  read?: boolean;
  data?: Record<string, unknown>;
};

interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Avoid duplicates by id
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) state.items.unshift({ ...action.payload, read: false });
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => (n.read = true));
    },
    clearAll: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearAll } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
