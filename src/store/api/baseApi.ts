import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Raw base query (cookie-based auth only)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    // Attach CSRF token from readable cookie for state-changing requests
    try {
      if (typeof document !== "undefined" && document.cookie) {
        const parts = document.cookie.split("; ");
        const lookup = (name: string) =>
          parts
            .find((c) => c.startsWith(name + "="))
            ?.substring(name.length + 1);
        const csrf = lookup("csrfToken");
        if (csrf && !headers.has("x-csrf-token")) {
          headers.set("x-csrf-token", csrf);
        }
      }
    } catch {
      /* noop */
    }
    return headers;
  },
});

// Wrapper adds silent refresh retry on 401
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (
    result.error &&
    result.error.status === 401 &&
    typeof args === "object" &&
    (args as FetchArgs).url &&
    !(args as FetchArgs).url?.startsWith("/auth/refresh") &&
    !(args as FetchArgs).url?.startsWith("/auth/login")
  ) {
    // Attempt refresh
    const refresh = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );
    if (refresh.data) {
      // retry original
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};

// Define the base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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
