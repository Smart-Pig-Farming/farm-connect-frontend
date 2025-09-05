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
  action?: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  resource?: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  };
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

    // Create action
    createAction: builder.mutation<
      Action,
      { name: string; description: string }
    >({
      query: (data) => ({
        url: "/admin/actions",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Action>) => response.data,
      invalidatesTags: ["Action"],
    }),

    // Update action
    updateAction: builder.mutation<
      Action,
      { id: number; name?: string; description?: string; is_active?: boolean }
    >({
      query: ({ id, ...data }) => ({
        url: `/admin/actions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Action>) => response.data,
      invalidatesTags: ["Action"],
    }),

    // Delete action
    deleteAction: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/actions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Action"],
    }),

    // Get all resources
    getResources: builder.query<Resource[], void>({
      query: () => "/admin/resources",
      transformResponse: (response: ApiResponse<Resource[]>) => response.data,
      providesTags: ["Resource"],
    }),

    // Create resource
    createResource: builder.mutation<
      Resource,
      { name: string; description: string }
    >({
      query: (data) => ({
        url: "/admin/resources",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Resource>) => response.data,
      invalidatesTags: ["Resource"],
    }),

    // Update resource
    updateResource: builder.mutation<
      Resource,
      { id: number; name?: string; description?: string; is_active?: boolean }
    >({
      query: ({ id, ...data }) => ({
        url: `/admin/resources/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Resource>) => response.data,
      invalidatesTags: ["Resource"],
    }),

    // Delete resource
    deleteResource: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resource"],
    }),

    // Get all permissions
    getPermissions: builder.query<Permission[], void>({
      query: () => "/admin/permissions",
      transformResponse: (response: ApiResponse<Permission[]>) => response.data,
      providesTags: ["Permission"],
    }),

    // Create permission
    createPermission: builder.mutation<
      Permission,
      { action: string; resource: string; description: string }
    >({
      query: (data) => ({
        url: "/admin/permissions",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Permission>) => response.data,
      invalidatesTags: ["Permission"],
    }),

    // Update permission
    updatePermission: builder.mutation<
      Permission,
      { id: number; description?: string; is_active?: boolean }
    >({
      query: ({ id, ...data }) => ({
        url: `/admin/permissions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Permission>) => response.data,
      invalidatesTags: ["Permission"],
    }),

    // Delete permission
    deletePermission: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/permissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permission"],
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
  useCreateActionMutation,
  useUpdateActionMutation,
  useDeleteActionMutation,
  useGetResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
  useGetUserPermissionsQuery,
} = permissionsApi;
