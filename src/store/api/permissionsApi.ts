import { baseApi } from "./baseApi";

// Types
export interface Action {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  action_id: number;
  resource_id: number;
  createdAt: string;
  updatedAt: string;
  action?: string;
  resource?: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  id: number;
  email: string;
  role: string;
  permissions: string[];
}

// API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: string;
}

// Inject endpoints into base API
export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all actions
    getActions: builder.query<Action[], void>({
      query: () => "/admin/actions",
      transformResponse: (response: ApiResponse<Action[]>) => response.data,
      providesTags: ["Action"],
    }),

    // Get all resources
    getResources: builder.query<Resource[], void>({
      query: () => "/admin/resources",
      transformResponse: (response: ApiResponse<Resource[]>) => response.data,
      providesTags: ["Resource"],
    }),

    // Get all permissions
    getPermissions: builder.query<Permission[], void>({
      query: () => "/admin/permissions",
      transformResponse: (response: ApiResponse<Permission[]>) => response.data,
      providesTags: ["Permission"],
    }),

    // Get role permissions
    getRolePermissions: builder.query<Permission[], number>({
      query: (roleId) => `/admin/roles/${roleId}/permissions`,
      transformResponse: (response: ApiResponse<Permission[]>) => response.data,
      providesTags: ["RolePermission"],
    }),

    // Update role permissions
    updateRolePermissions: builder.mutation<
      { success: boolean; message: string },
      { roleId: number; permissionIds: number[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/admin/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissionIds },
      }),
      invalidatesTags: ["RolePermission"],
    }),

    // Get user permissions (for debugging)
    getUserPermissions: builder.query<UserPermissions, number>({
      query: (userId) => `/admin/users/${userId}/permissions`,
      transformResponse: (response: ApiResponse<UserPermissions>) =>
        response.data,
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetActionsQuery,
  useGetResourcesQuery,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
  useGetUserPermissionsQuery,
} = permissionsApi;
