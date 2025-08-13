import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface NotificationItem {
  id: string;
  type:
    | "post_vote"
    | "reply_created"
    | "reply_vote"
    | "post_approved"
    | "mention"
    | "post_reported"
    | "moderation_decision_reporter"
    | "moderation_decision_owner";
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/notifications",
    credentials: "include",
  }),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      {
        success: boolean;
        data: NotificationsResponse;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => `/?page=${page}&limit=${limit}`,
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<
      { success: boolean; data: UnreadCountResponse },
      void
    >({
      query: () => "/unread-count",
      providesTags: ["UnreadCount"],
    }),

    markNotificationsAsRead: builder.mutation<
      { success: boolean; message: string },
      { notificationIds: string[] }
    >({
      query: (body) => ({
        url: "/mark-read",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    markAllNotificationsAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    clearAllNotifications: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useClearAllNotificationsMutation,
} = notificationsApi;
