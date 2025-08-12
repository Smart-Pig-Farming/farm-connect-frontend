import type { User } from "./user";

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterFarmerRequest {
  firstName: string;
  lastName: string;
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
    user: User;
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

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstname: string;
  lastname: string;
  email: string;
  province: string;
  district: string;
  sector: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}
