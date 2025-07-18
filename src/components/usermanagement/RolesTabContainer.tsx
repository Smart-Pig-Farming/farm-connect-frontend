import { useState } from "react";
import { toast } from "sonner";
import { RolesTabContent } from "./RolesTabContent";
import { RoleFormModal } from "./RoleFormModal";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  type Role,
} from "../../store/api/rolesApi";
import { useGetPermissionsQuery } from "../../store/api/permissionsApi";

// Transform API types to match component types
interface ComponentRole {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

// Transform function
const transformRole = (role: Role): ComponentRole => ({
  id: role.id,
  name: role.name,
  description: role.description || "",
  userCount: role.userCount || 0,
  permissions:
    role.permissions?.map((permission) => {
      const action = permission.action?.name || "Unknown";
      const resource = permission.resource?.name || "Unknown";
      return `${action}:${resource}`;
    }) || [],
});

export function RolesTabContainer() {
  // Modal states
  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    role?: ComponentRole | null;
  }>({
    isOpen: false,
    mode: "create",
    role: null,
  });

  // API queries
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetRolesQuery();

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useGetPermissionsQuery();

  // Role mutations
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  // Handle loading states
  if (rolesLoading || permissionsLoading) {
    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Role Management</h2>
          <p className="text-gray-600">Loading roles data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (rolesError || permissionsError) {
    const errorMsg =
      (rolesError as { data?: { error?: string } })?.data?.error ||
      (permissionsError as { data?: { error?: string } })?.data?.error ||
      "Failed to load roles data";

    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Role Management</h2>
          <p className="text-gray-600">Error loading roles data</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform data for the component
  const roles: ComponentRole[] = rolesData?.map(transformRole) || [];

  // Modal handlers
  const handleCreateRole = () => {
    setRoleModal({
      isOpen: true,
      mode: "create",
      role: null,
    });
  };

  const handleEditRole = (role: ComponentRole) => {
    setRoleModal({
      isOpen: true,
      mode: "edit",
      role: role,
    });
  };

  const handleDeleteRole = async (role: ComponentRole) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Delete Role</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete the role "{role.name}"? This
                action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    toast.dismiss(t);
                    try {
                      await deleteRole(role.id).unwrap();
                      toast.success("Role Deleted", {
                        description: `Role "${role.name}" has been deleted successfully.`,
                      });
                    } catch (error: unknown) {
                      const errorMessage =
                        error && typeof error === "object" && "data" in error
                          ? (error as { data?: { error?: string } }).data?.error
                          : "An unexpected error occurred.";
                      toast.error("Failed to Delete Role", {
                        description: errorMessage,
                      });
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  // Modal submit handlers
  const handleRoleSubmit = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      if (roleModal.mode === "create") {
        await createRole(data).unwrap();
        toast.success("Role Created", {
          description: `Role "${data.name}" has been created successfully.`,
        });
      } else if (roleModal.role) {
        await updateRole({ id: roleModal.role.id, role: data }).unwrap();
        toast.success("Role Updated", {
          description: "Role has been updated successfully.",
        });
      }
      setRoleModal({ isOpen: false, mode: "create", role: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error(
        `Failed to ${roleModal.mode === "create" ? "Create" : "Update"} Role`,
        {
          description: errorMessage,
        }
      );
    }
  };

  // Transform permissions for form
  const availablePermissions =
    permissionsData?.map((permission) => ({
      id: permission.id,
      action: permission.action?.name || "Unknown",
      resource: permission.resource?.name || "Unknown",
      name: permission.name,
      description: permission.description || "",
    })) || [];

  return (
    <>
      <RolesTabContent
        roles={roles}
        onCreateRole={handleCreateRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
      />

      {/* Role Modal */}
      <RoleFormModal
        isOpen={roleModal.isOpen}
        onClose={() =>
          setRoleModal({ isOpen: false, mode: "create", role: null })
        }
        onSubmit={handleRoleSubmit}
        role={roleModal.role}
        mode={roleModal.mode}
        availablePermissions={availablePermissions}
      />
    </>
  );
}
