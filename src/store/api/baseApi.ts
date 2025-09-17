import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Compute API base URL from env with safe fallback & normalization.
// Rules:
//  - Use VITE_API_URL if provided.
//  - If VITE_API_URL already ends with /api (case-insensitive), don't append again.
//  - Strip trailing slashes before appending.
//  - If no env provided, prefer same-origin "/api" at runtime to avoid baking localhost in prod.
//  - Support relative usage by setting VITE_API_URL="" (results in "/api").
function computeApiBaseUrl(): string {
  // Vite exposes env vars on import.meta.env at build time (typed as any in generated d.ts)
  const rawFromImportMeta = (
    import.meta as { env?: Record<string, string | undefined> }
  )?.env?.VITE_API_URL;
  let raw = rawFromImportMeta; // Use only import.meta.env for Vite
  if (!raw) {
    // In production builds where env isn't set, default to same-origin.
    // This prevents bundling a hardcoded localhost URL into the dist.
    if (typeof window !== "undefined") return "/api";
    // Non-browser contexts (tests, SSR) can use localhost as a last resort
    return "http://localhost:5000/api";
  }
  raw = raw.trim();
  if (raw === "" || raw === "/") return "/api"; // relative same-origin
  // Remove trailing slashes (but keep single root case handled above)
  raw = raw.replace(/\/+$/, "");
  // If it already ends with /api, return as-is
  if (/\/api$/i.test(raw)) return raw;
  return `${raw}/api`;
}

const resolvedBaseUrl = computeApiBaseUrl();

// Raw base query (cookie-based auth only)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: resolvedBaseUrl,
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
