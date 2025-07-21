import { baseApi } from "./baseApi";
import type {
  LoginRequest,
  RegisterFarmerRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
} from "@/types";

// Auth API slice - extending the base API
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // Register farmer endpoint
    registerFarmer: builder.mutation<AuthResponse, RegisterFarmerRequest>({
      query: (userData) => ({
        url: "/auth/register/farmer",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // Logout endpoint
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Forgot password endpoint
    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // Reset password endpoint
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // Verify OTP endpoint
    verifyOtp: builder.mutation<
      { success: boolean; message: string; data?: { resetToken: string } },
      { email: string; otp: string }
    >({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Resend OTP endpoint
    resendOtp: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<
      {
        success: boolean;
        data: User;
      },
      void
    >({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Get current user permissions
    getCurrentUserPermissions: builder.query<{ permissions: string[] }, void>({
      query: () => "/auth/permissions",
      providesTags: ["Permission"],
    }),

    // First-time account verification
    verifyAccount: builder.mutation<
      AuthResponse,
      { email: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/verify-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Change password for authenticated user
    changePassword: builder.mutation<
      { success: boolean; message: string },
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),

    // Update profile for authenticated user
    updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterFarmerMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
  useGetCurrentUserQuery,
  useGetCurrentUserPermissionsQuery,
  useResendOtpMutation,
  useVerifyAccountMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;
