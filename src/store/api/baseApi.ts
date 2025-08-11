import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// No RootState import needed since we don't read from store in prepareHeaders

// Define the base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // Include HttpOnly cookies in requests
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");

      // Authentication is cookie-based (HttpOnly). No bearer token needed.
      // If in the future we add a token to auth state, it can be set here.

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Farm",
    "Post",
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
  ],
  endpoints: () => ({}),
});
