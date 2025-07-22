import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // Include HttpOnly cookies in requests
    prepareHeaders: (headers) => {
      // No need to set Authorization header - authentication is via HttpOnly cookies
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Farm",
    "Post",
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
