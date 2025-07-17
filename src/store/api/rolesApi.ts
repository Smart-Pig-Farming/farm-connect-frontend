import { baseApi } from "./baseApi";

// API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  userCount?: number; // Virtual field for user count
  created_at: string;
  updated_at: string;
  permissions?: RolePermission[]; // Associated permissions
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
}

export interface RoleUpdatePayload {
  name: string;
  description?: string;
}

export interface RolePermission {
  id: number;
  name: string;
  description?: string;
  action?: {
    id: number;
    name: string;
  };
  resource?: {
    id: number;
    name: string;
  };
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

export interface RolePermissionUpdatePayload {
  permissionIds: number[];
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => "/admin/roles",
      transformResponse: (response: ApiResponse<Role[]>) => response.data,
      providesTags: ["Role"],
    }),
    createRole: builder.mutation<Role, RoleCreatePayload>({
      query: (newRole) => ({
        url: "/admin/roles",
        method: "POST",
        body: newRole,
      }),
      transformResponse: (response: ApiResponse<Role>) => response.data,
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<Role, { id: number; role: RoleUpdatePayload }>(
      {
        query: ({ id, role }) => ({
          url: `/admin/roles/${id}`,
          method: "PUT",
          body: role,
        }),
        transformResponse: (response: ApiResponse<Role>) => response.data,
        invalidatesTags: ["Role"],
      }
    ),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
    getRolePermissions: builder.query<RoleWithPermissions, number>({
      query: (roleId) => `/admin/roles/${roleId}/permissions`,
      transformResponse: (response: ApiResponse<RoleWithPermissions>) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Role", id }],
    }),
    updateRolePermissions: builder.mutation<
      void,
      { roleId: number; permissions: RolePermissionUpdatePayload }
    >({
      query: ({ roleId, permissions }) => ({
        url: `/admin/roles/${roleId}/permissions`,
        method: "PUT",
        body: permissions,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: "Role", id: roleId },
        "Role",
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} = rolesApi;
