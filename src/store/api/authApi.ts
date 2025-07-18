import { baseApi } from "./baseApi";

// Types for auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterFarmerRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  farmName: string;
  province: string;
  district: string;
  sector: string;
  field?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      firstname: string;
      lastname: string;
      email: string;
      username: string;
      role: string;
      permissions: string[];
    };
    token: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

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
        data: {
          id: number;
          firstname: string;
          lastname: string;
          email: string;
          username: string;
          role: string;
          permissions: string[];
        };
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
} = authApi;
