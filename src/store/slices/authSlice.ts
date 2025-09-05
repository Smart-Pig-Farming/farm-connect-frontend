import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user data after successful authentication (HttpOnly cookies handle tokens)
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      // Note: authentication is handled via HttpOnly cookies
    },

    // Set user data (fetched from API)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setUser,
  logout,
  updateUser,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
