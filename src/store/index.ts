import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import RTK Query API slices
import { baseApi } from "./api/baseApi";
import "./api/authApi";
import "./api/userApi";
import "./api/contentApi";

// Import regular slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    // RTK Query API
    [baseApi.reducerPath]: baseApi.reducer,

    // Regular slices
    auth: authSlice,
    ui: uiSlice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
      },
    }).concat(baseApi.middleware),

  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export { useAppDispatch, useAppSelector } from "./hooks";

// Export API hooks
export * from "./api";

// Export slice actions
export * from "./slices/authSlice";
export * from "./slices/uiSlice";
