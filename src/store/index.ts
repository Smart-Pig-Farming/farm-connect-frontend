import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage/session";
import { combineReducers } from "@reduxjs/toolkit";

// Import RTK Query API slices
import { baseApi } from "./api/baseApi";
import "./api/authApi";
import "./api/userApi";
import "./api/permissionsApi";
import "./api/discussionsApi";

// Import regular slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";

// Configure persistence for auth slice (token only)
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token"], // Only persist token, not user data
};

// Combine reducers
const rootReducer = combineReducers({
  // RTK Query API
  [baseApi.reducerPath]: baseApi.reducer,

  // Regular slices
  auth: persistReducer(authPersistConfig, authSlice),
  ui: uiSlice,
});

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),

  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export { useAppDispatch, useAppSelector } from "./hooks";

// Export API hooks
export * from "./api";

// Export slice actions
export * from "./slices/authSlice";
export * from "./slices/uiSlice";
