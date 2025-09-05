import { useState } from "react";
import { toast } from "sonner";
import { PermissionsTabContent } from "./PermissionsTabContent";
import { ActionFormModal } from "./ActionFormModal";
import { ResourceFormModal } from "./ResourceFormModal";
import { PermissionFormModal } from "./PermissionFormModal";
import {
  useGetActionsQuery,
  useGetResourcesQuery,
  useGetPermissionsQuery,
  useCreateActionMutation,
  useUpdateActionMutation,
  useDeleteActionMutation,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  type Action,
  type Resource,
  type Permission,
} from "../../store/api/permissionsApi";

// Transform API types to match component types
interface ComponentAction {
  id: number;
  name: string;
  description: string;
}

interface ComponentResource {
  id: number;
  name: string;
  description: string;
}

interface ComponentPermission {
  id: number;
  action: string;
  resource: string;
  name: string;
  description: string;
}

// Transform functions
const transformAction = (action: Action): ComponentAction => ({
  id: action.id,
  name: action.name,
  description: action.description,
});

const transformResource = (resource: Resource): ComponentResource => ({
  id: resource.id,
  name: resource.name,
  description: resource.description,
});

const transformPermission = (
  permission: Permission,
  actions: Action[],
  resources: Resource[]
): ComponentPermission => {
  const action = actions.find((a) => a.id === permission.action_id);
  const resource = resources.find((r) => r.id === permission.resource_id);

  return {
    id: permission.id,
    action: action?.name || "Unknown",
    resource: resource?.name || "Unknown",
    name: permission.name,
    description: permission.description,
  };
};

export function PermissionsTabContainer() {
  // Modal states
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    action?: Action | null;
  }>({
    isOpen: false,
    mode: "create",
    action: null,
  });

  const [resourceModal, setResourceModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    resource?: Resource | null;
  }>({
    isOpen: false,
    mode: "create",
    resource: null,
  });

  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    permission?: {
      id: number;
      action: string;
      resource: string;
      name: string;
      description: string;
    } | null;
  }>({
    isOpen: false,
    mode: "create",
    permission: null,
  });

  const {
    data: actionsData,
    isLoading: actionsLoading,
    error: actionsError,
  } = useGetActionsQuery();

  const {
    data: resourcesData,
    isLoading: resourcesLoading,
    error: resourcesError,
  } = useGetResourcesQuery();

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useGetPermissionsQuery();

  // Action mutations
  const [createAction] = useCreateActionMutation();
  const [updateAction] = useUpdateActionMutation();
  const [deleteAction] = useDeleteActionMutation();

  // Resource mutations
  const [createResource] = useCreateResourceMutation();
  const [updateResource] = useUpdateResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();

  // Permission mutations
  const [createPermission] = useCreatePermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();

  // Handle loading states
  if (actionsLoading || resourcesLoading || permissionsLoading) {
    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Permission Management</h2>
          <p className="text-gray-600">Loading permissions data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (actionsError || resourcesError || permissionsError) {
    const errorMsg =
      (actionsError as { data?: { error?: string } })?.data?.error ||
      (resourcesError as { data?: { error?: string } })?.data?.error ||
      (permissionsError as { data?: { error?: string } })?.data?.error ||
      "Failed to load permissions data";

    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Permission Management</h2>
          <p className="text-gray-600">Error loading permissions data</p>
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
  const actions: ComponentAction[] = actionsData?.map(transformAction) || [];
  const resources: ComponentResource[] =
    resourcesData?.map(transformResource) || [];
  const permissions: ComponentPermission[] =
    permissionsData?.map((permission) =>
      transformPermission(permission, actionsData || [], resourcesData || [])
    ) || [];

  // Modal handlers
  const handleCreatePermission = () => {
    setPermissionModal({
      isOpen: true,
      mode: "create",
      permission: null,
    });
  };

  const handleEditPermission = (permission: ComponentPermission) => {
    // Find the actual permission data and transform it for the modal
    const fullPermission = permissionsData?.find((p) => p.id === permission.id);
    if (fullPermission) {
      const action = actionsData?.find(
        (a) => a.id === fullPermission.action_id
      );
      const resource = resourcesData?.find(
        (r) => r.id === fullPermission.resource_id
      );

      const transformedPermission = {
        id: fullPermission.id,
        action: action?.name || "",
        resource: resource?.name || "",
        name: fullPermission.name,
        description: fullPermission.description,
      };

      setPermissionModal({
        isOpen: true,
        mode: "edit",
        permission: transformedPermission,
      });
    }
  };

  const handleDeletePermission = async (permission: ComponentPermission) => {
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
              <h3 className="font-medium text-gray-900 mb-1">
                Delete Permission
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete the permission "
                {permission.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    toast.dismiss(t);
                    try {
                      await deletePermission(permission.id).unwrap();
                      toast.success("Permission Deleted", {
                        description: `Permission "${permission.name}" has been deleted successfully.`,
                      });
                    } catch (error: unknown) {
                      const errorMessage =
                        error && typeof error === "object" && "data" in error
                          ? (error as { data?: { error?: string } }).data?.error
                          : "An unexpected error occurred.";
                      toast.error("Failed to Delete Permission", {
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

  const handleCreateAction = () => {
    setActionModal({
      isOpen: true,
      mode: "create",
      action: null,
    });
  };

  const handleEditAction = (action: ComponentAction) => {
    // Find the actual action data
    const fullAction = actionsData?.find((a) => a.id === action.id);
    if (fullAction) {
      setActionModal({
        isOpen: true,
        mode: "edit",
        action: fullAction,
      });
    }
  };

  const handleDeleteAction = async (action: ComponentAction) => {
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
              <h3 className="font-medium text-gray-900 mb-1">Delete Action</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete the action "{action.name}"? This
                action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    toast.dismiss(t);
                    try {
                      await deleteAction(action.id).unwrap();
                      toast.success("Action Deleted", {
                        description: `Action "${action.name}" has been deleted successfully.`,
                      });
                    } catch (error: unknown) {
                      const errorMessage =
                        error && typeof error === "object" && "data" in error
                          ? (error as { data?: { error?: string } }).data?.error
                          : "An unexpected error occurred.";
                      toast.error("Failed to Delete Action", {
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

  const handleCreateResource = () => {
    setResourceModal({
      isOpen: true,
      mode: "create",
      resource: null,
    });
  };

  const handleEditResource = (resource: ComponentResource) => {
    // Find the actual resource data
    const fullResource = resourcesData?.find((r) => r.id === resource.id);
    if (fullResource) {
      setResourceModal({
        isOpen: true,
        mode: "edit",
        resource: fullResource,
      });
    }
  };

  const handleDeleteResource = async (resource: ComponentResource) => {
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
              <h3 className="font-medium text-gray-900 mb-1">
                Delete Resource
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete the resource "{resource.name}"?
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    toast.dismiss(t);
                    try {
                      await deleteResource(resource.id).unwrap();
                      toast.success("Resource Deleted", {
                        description: `Resource "${resource.name}" has been deleted successfully.`,
                      });
                    } catch (error: unknown) {
                      const errorMessage =
                        error && typeof error === "object" && "data" in error
                          ? (error as { data?: { error?: string } }).data?.error
                          : "An unexpected error occurred.";
                      toast.error("Failed to Delete Resource", {
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
  const handleActionSubmit = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      if (actionModal.mode === "create") {
        await createAction(data).unwrap();
        toast.success("Action Created", {
          description: `Action "${data.name}" has been created successfully.`,
        });
      } else if (actionModal.action) {
        await updateAction({ id: actionModal.action.id, ...data }).unwrap();
        toast.success("Action Updated", {
          description: "Action has been updated successfully.",
        });
      }
      setActionModal({ isOpen: false, mode: "create", action: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error(
        `Failed to ${
          actionModal.mode === "create" ? "Create" : "Update"
        } Action`,
        {
          description: errorMessage,
        }
      );
    }
  };

  const handleResourceSubmit = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      if (resourceModal.mode === "create") {
        await createResource(data).unwrap();
        toast.success("Resource Created", {
          description: `Resource "${data.name}" has been created successfully.`,
        });
      } else if (resourceModal.resource) {
        await updateResource({
          id: resourceModal.resource.id,
          ...data,
        }).unwrap();
        toast.success("Resource Updated", {
          description: "Resource has been updated successfully.",
        });
      }
      setResourceModal({ isOpen: false, mode: "create", resource: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error(
        `Failed to ${
          resourceModal.mode === "create" ? "Create" : "Update"
        } Resource`,
        {
          description: errorMessage,
        }
      );
    }
  };

  const handlePermissionSubmit = async (data: {
    action: string;
    resource: string;
    description: string;
  }) => {
    try {
      if (permissionModal.mode === "create") {
        await createPermission(data).unwrap();
        toast.success("Permission Created", {
          description: "Permission has been created successfully.",
        });
      } else if (permissionModal.permission) {
        await updatePermission({
          id: permissionModal.permission.id,
          ...data,
        }).unwrap();
        toast.success("Permission Updated", {
          description: "Permission has been updated successfully.",
        });
      }
      setPermissionModal({ isOpen: false, mode: "create", permission: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error(
        `Failed to ${
          permissionModal.mode === "create" ? "Create" : "Update"
        } Permission`,
        {
          description: errorMessage,
        }
      );
    }
  };

  return (
    <>
      <PermissionsTabContent
        permissions={permissions}
        actions={actions}
        resources={resources}
        onCreatePermission={handleCreatePermission}
        onEditPermission={handleEditPermission}
        onDeletePermission={handleDeletePermission}
        onCreateAction={handleCreateAction}
        onEditAction={handleEditAction}
        onDeleteAction={handleDeleteAction}
        onCreateResource={handleCreateResource}
        onEditResource={handleEditResource}
        onDeleteResource={handleDeleteResource}
      />

      {/* Action Modal */}
      <ActionFormModal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, mode: "create", action: null })
        }
        onSubmit={handleActionSubmit}
        action={actionModal.action}
        mode={actionModal.mode}
      />

      {/* Resource Modal */}
      <ResourceFormModal
        isOpen={resourceModal.isOpen}
        onClose={() =>
          setResourceModal({ isOpen: false, mode: "create", resource: null })
        }
        onSubmit={handleResourceSubmit}
        resource={resourceModal.resource}
        mode={resourceModal.mode}
      />

      {/* Permission Modal */}
      <PermissionFormModal
        isOpen={permissionModal.isOpen}
        onClose={() =>
          setPermissionModal({
            isOpen: false,
            mode: "create",
            permission: null,
          })
        }
        onSubmit={handlePermissionSubmit}
        permission={permissionModal.permission}
        mode={permissionModal.mode}
        availableActions={actionsData || []}
        availableResources={resourcesData || []}
      />
    </>
  );
}
