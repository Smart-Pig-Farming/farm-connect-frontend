import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  // Navigation state
  sidebarOpen: boolean;

  // Modal states
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;

  // Loading states for global operations
  isGlobalLoading: boolean;

  // Toast/notification state
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }>;

  // Preferences
  language: "en" | "rw";

  // Filter states for lists
  postFilters: {
    tags: string[];
    search: string;
    sortBy: "newest" | "oldest" | "popular";
  };

  // Pagination states
  currentPage: number;
  itemsPerPage: number;
}

const initialState: UiState = {
  sidebarOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isGlobalLoading: false,
  notifications: [],
  language: "en",
  postFilters: {
    tags: [],
    search: "",
    sortBy: "newest",
  },
  currentPage: 1,
  itemsPerPage: 10,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Modal actions
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
      state.isRegisterModalOpen = false;
    },

    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },

    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
      state.isLoginModalOpen = false;
    },

    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },

    closeAllModals: (state) => {
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },

    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<Omit<UiState["notifications"][0], "id">>
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Language actions
    setLanguage: (state, action: PayloadAction<"en" | "rw">) => {
      state.language = action.payload;
    },

    // Filter actions
    setPostFilters: (
      state,
      action: PayloadAction<Partial<UiState["postFilters"]>>
    ) => {
      state.postFilters = { ...state.postFilters, ...action.payload };
    },

    resetPostFilters: (state) => {
      state.postFilters = initialState.postFilters;
    },

    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing items per page
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openLoginModal,
  closeLoginModal,
  openRegisterModal,
  closeRegisterModal,
  closeAllModals,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setLanguage,
  setPostFilters,
  resetPostFilters,
  setCurrentPage,
  setItemsPerPage,
} = uiSlice.actions;

export default uiSlice.reducer;
