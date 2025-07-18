import { baseApi } from "./baseApi";

// Types for user endpoints matching backend structure
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  organization?: string;
  sector?: string;
  district?: string;
  province?: string;
  is_verified: boolean;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  level?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface UserFilters {
  search?: string;
  status?: "all" | "active" | "locked" | "unverified";
  role?: string;
  roleId?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password?: string; // Optional - generated automatically for admin-created users
  organization?: string;
  sector?: string;
  district?: string;
  province?: string;
  role_id: number;
  level_id?: number;
}

export interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  email?: string;
  username?: string;
  organization?: string;
  sector?: string;
  district?: string;
  province?: string;
  role_id?: number;
  level_id?: number;
}

export interface UserStats {
  total: number;
  active: number;
  locked: number;
  unverified: number;
  byRole: Record<string, number>;
  byLevel: Record<string, number>;
  recentCount: number;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
  warning?: string;
}

export interface UserListApiResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface ApiErrorResponse {
  status: number;
  data: {
    success: boolean;
    error: string;
    code?: string;
    details?: string;
  };
}

// User API slice
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get users with pagination, search, and filtering
    getUsers: builder.query<
      UserListApiResponse,
      UserFilters & PaginationParams
    >({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["User"],
    }),

    // Get user by ID
    getUserById: builder.query<UserResponse, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    // Create user
    createUser: builder.mutation<UserResponse, CreateUserData>({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Update user
    updateUser: builder.mutation<
      UserResponse,
      { id: number; data: UpdateUserData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<{ success: boolean; message: string }, number>(
      {
        query: (id) => ({
          url: `/admin/users/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: "User", id },
          "User",
        ],
      }
    ),

    // Toggle user lock status
    toggleUserLock: builder.mutation<UserResponse, number>({
      query: (id) => ({
        url: `/admin/users/${id}/lock`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "User", id }, "User"],
    }),

    // Verify user email
    verifyUser: builder.mutation<UserResponse, number>({
      query: (id) => ({
        url: `/admin/users/${id}/verify`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "User", id }, "User"],
    }),

    // Resend user credentials
    resendUserCredentials: builder.mutation<UserResponse, number>({
      query: (id) => ({
        url: `/admin/users/${id}/resend-credentials`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "User", id }, "User"],
    }),

    // Get user statistics
    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => "/admin/users-stats",
      providesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserLockMutation,
  useVerifyUserMutation,
  useResendUserCredentialsMutation,
  useGetUserStatsQuery,
} = userApi;
