import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Only set token without user data (for initial load from persisted storage)
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Set user data (fetched from API after token is available)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
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
  setToken,
  setUser,
  logout,
  updateUser,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
