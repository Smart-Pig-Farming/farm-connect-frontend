import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// No RootState import needed since we don't read from store in prepareHeaders

// Define the base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // Include HttpOnly cookies in requests
    prepareHeaders: (headers) => {
      // Mirror accessToken & csrfToken cookies into headers when present
      try {
        if (typeof document !== "undefined" && document.cookie) {
          const parts = document.cookie.split("; ");
          const lookup = (name: string) =>
            parts
              .find((c) => c.startsWith(name + "="))
              ?.substring(name.length + 1);
          const accessToken = lookup("accessToken");
          const csrf = lookup("csrfToken");
          if (accessToken && !headers.has("authorization")) {
            headers.set("authorization", `Bearer ${accessToken}`);
          }
            // CSRF header only needed for state-changing requests but harmless for reads
          if (csrf && !headers.has("x-csrf-token")) {
            headers.set("x-csrf-token", csrf);
          }
        }
      } catch {
        // ignore
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Farm",
    "Post",
    "Reply",
    "Tag",
    "BestPractice",
    "Quiz",
    "Comment",
    "Report",
    "Action",
    "Resource",
    "Permission",
    "Role",
    "RolePermission",
    // Additional slices
    "Notifications",
    "UnreadCount",
    "PendingReports",
    "ModerationHistory",
  ],
  endpoints: () => ({}),
});
