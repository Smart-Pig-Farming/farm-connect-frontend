import { toast } from "sonner";
import { PermissionsTabContent } from "./PermissionsTabContent";
import {
  useGetActionsQuery,
  useGetResourcesQuery,
  useGetPermissionsQuery,
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

  // Event handlers (show notifications for now since backend doesn't have full CRUD)
  const handleCreatePermission = () => {
    toast.info("Create Permission", {
      description:
        "Permission creation is not yet implemented in the backend API.",
    });
  };

  const handleEditPermission = (permission: ComponentPermission) => {
    toast.info("Edit Permission", {
      description: `Edit functionality for permission "${permission.name}" is not yet implemented in the backend API.`,
    });
  };

  const handleDeletePermission = (permission: ComponentPermission) => {
    toast.info("Delete Permission", {
      description: `Delete functionality for permission "${permission.name}" is not yet implemented in the backend API.`,
    });
  };

  const handleCreateAction = () => {
    toast.info("Create Action", {
      description: "Action creation is not yet implemented in the backend API.",
    });
  };

  const handleEditAction = (action: ComponentAction) => {
    toast.info("Edit Action", {
      description: `Edit functionality for action "${action.name}" is not yet implemented in the backend API.`,
    });
  };

  const handleCreateResource = () => {
    toast.info("Create Resource", {
      description:
        "Resource creation is not yet implemented in the backend API.",
    });
  };

  const handleEditResource = (resource: ComponentResource) => {
    toast.info("Edit Resource", {
      description: `Edit functionality for resource "${resource.name}" is not yet implemented in the backend API.`,
    });
  };

  return (
    <PermissionsTabContent
      permissions={permissions}
      actions={actions}
      resources={resources}
      onCreatePermission={handleCreatePermission}
      onEditPermission={handleEditPermission}
      onDeletePermission={handleDeletePermission}
      onCreateAction={handleCreateAction}
      onEditAction={handleEditAction}
      onCreateResource={handleCreateResource}
      onEditResource={handleEditResource}
    />
  );
}
