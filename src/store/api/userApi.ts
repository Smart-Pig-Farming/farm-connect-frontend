import { baseApi } from "./baseApi";

// Types for user endpoints
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  province?: string;
  district?: string;
  sector?: string;
  role: "farmer" | "vet" | "government" | "admin";
  isVerified: boolean;
  isLocked: boolean;
  points: number;
  level: "Amateur" | "Knight" | "Expert";
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  farmName?: string;
  province?: string;
  district?: string;
  sector?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: "vet" | "government" | "admin";
  farmName?: string;
  province?: string;
  district?: string;
  sector?: string;
}

// User API slice
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Get all users (admin only)
    getUsers: builder.query<
      User[],
      { page?: number; limit?: number; role?: string }
    >({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["User"],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),

    // Update user profile
    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/users/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["User"],
      }
    ),

    // Change password
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/users/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    // Create user (admin only)
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Toggle user lock status (admin only)
    toggleUserLock: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}/toggle-lock`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    // Assign role to user (admin only)
    assignRole: builder.mutation<User, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user (admin only)
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCurrentUserQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useCreateUserMutation,
  useToggleUserLockMutation,
  useAssignRoleMutation,
  useDeleteUserMutation,
} = userApi;
