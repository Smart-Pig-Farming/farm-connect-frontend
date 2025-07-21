import { useState } from "react";
import { Shield, Plus, Edit, Trash2, Zap, Database } from "lucide-react";

// Types
interface Action {
  id: number;
  name: string;
  description: string;
}

interface Resource {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  action: string;
  resource: string;
  name: string; // Action:Resource format
  description: string;
}

interface PermissionsTabContentProps {
  permissions: Permission[];
  actions: Action[];
  resources: Resource[];
  onCreatePermission: () => void;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permission: Permission) => void;
  onCreateAction: () => void;
  onEditAction: (action: Action) => void;
  onDeleteAction?: (action: Action) => void;
  onCreateResource: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource?: (resource: Resource) => void;
}

export function PermissionsTabContent({
  permissions,
  actions,
  resources,
  onCreatePermission,
  onEditPermission,
  onDeletePermission,
  onCreateAction,
  onEditAction,
  onDeleteAction,
  onCreateResource,
  onEditResource,
  onDeleteResource,
}: PermissionsTabContentProps) {
  const [permissionsSubTab, setPermissionsSubTab] = useState<
    "permissions" | "actions" | "resources"
  >("permissions");

  return (
    <div className="p-3 sm:p-6 w-full min-w-0">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 break-words">
          Permission Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600 break-words">
          Manage actions, resources, and granular permissions using
          Action:Resource combinations
        </p>
      </div>

      {/* Permissions Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        {/* Desktop Sub-tabs */}
        <nav className="hidden sm:flex space-x-8">
          <button
            onClick={() => setPermissionsSubTab("permissions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              permissionsSubTab === "permissions"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="w-4 h-4" />
            Permissions ({permissions.length})
          </button>
          <button
            onClick={() => setPermissionsSubTab("actions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              permissionsSubTab === "actions"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            Actions ({actions.length})
          </button>
          <button
            onClick={() => setPermissionsSubTab("resources")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              permissionsSubTab === "resources"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Database className="w-4 h-4" />
            Resources ({resources.length})
          </button>
        </nav>

        {/* Mobile Sub-tabs Dropdown */}
        <div className="sm:hidden">
          <select
            value={permissionsSubTab}
            onChange={(e) =>
              setPermissionsSubTab(
                e.target.value as "permissions" | "actions" | "resources"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            <option value="permissions">
              🛡️ Permissions ({permissions.length})
            </option>
            <option value="actions">⚡ Actions ({actions.length})</option>
            <option value="resources">🗂️ Resources ({resources.length})</option>
          </select>
        </div>
      </div>

      {/* Permissions List */}
      {permissionsSubTab === "permissions" && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium">System Permissions</h3>
            <button
              onClick={onCreatePermission}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Create Permission
            </button>
          </div>

          {/* Desktop/Tablet Permissions List */}
          <div className="hidden md:block space-y-4">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium break-words">
                        {permission.action}
                      </span>
                      <span className="text-sm text-gray-400">:</span>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium break-words">
                        {permission.resource}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 break-words">
                    {permission.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => onEditPermission(permission)}
                    className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                    title="Edit Permission"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePermission(permission)}
                    className="text-red-600 hover:text-red-900 hover:cursor-pointer p-2 rounded-lg hover:bg-red-50"
                    title="Delete Permission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Permissions List */}
          <div className="md:hidden space-y-4 w-full">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm w-full min-w-0"
              >
                <div className="flex-1 min-w-0 mb-3">
                  <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1 mb-2 w-fit">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium break-words">
                      {permission.action}
                    </span>
                    <span className="text-xs text-gray-400">:</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium break-words">
                      {permission.resource}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 break-words">
                    {permission.description}
                  </p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onEditPermission(permission)}
                    className="flex-1 text-sm text-orange-600 border border-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 hover:cursor-pointer transition-colors flex items-center justify-center gap-2 break-words"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePermission(permission)}
                    className="flex-1 text-sm text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 hover:cursor-pointer transition-colors flex items-center justify-center gap-2 break-words"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for Permissions */}
          {permissions.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">
                No permissions found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first permission to get started.
              </p>
              <button
                onClick={onCreatePermission}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Permission
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions List */}
      {permissionsSubTab === "actions" && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium break-words">System Actions</h3>
            <button
              onClick={onCreateAction}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
            >
              <Plus className="w-4 h-4" />
              Create Action
            </button>
          </div>

          {/* Actions Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => (
              <div
                key={action.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900 break-words">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-500 break-words">
                    {action.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditAction(action)}
                    className="flex-1 text-sm text-orange-600 border border-orange-600 px-3 py-2 rounded hover:bg-orange-50 hover:cursor-pointer transition-colors break-words"
                  >
                    Edit Action
                  </button>
                  {onDeleteAction && (
                    <button
                      onClick={() => onDeleteAction(action)}
                      className="text-sm text-red-600 border border-red-600 px-3 py-2 rounded hover:bg-red-50 hover:cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for Actions */}
          {actions.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">
                No actions found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first action to get started.
              </p>
              <button
                onClick={onCreateAction}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Action
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resources List */}
      {permissionsSubTab === "resources" && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium break-words">
              System Resources
            </h3>
            <button
              onClick={onCreateResource}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
            >
              <Plus className="w-4 h-4" />
              Create Resource
            </button>
          </div>

          {/* Resources Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900 break-words">
                    {resource.name}
                  </h4>
                  <p className="text-sm text-gray-500 break-words">
                    {resource.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditResource(resource)}
                    className="flex-1 text-sm text-orange-600 border border-orange-600 px-3 py-2 rounded hover:bg-orange-50 hover:cursor-pointer transition-colors break-words"
                  >
                    Edit Resource
                  </button>
                  {onDeleteResource && (
                    <button
                      onClick={() => onDeleteResource(resource)}
                      className="text-sm text-red-600 border border-red-600 px-3 py-2 rounded hover:bg-red-50 hover:cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for Resources */}
          {resources.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">
                No resources found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first resource to get started.
              </p>
              <button
                onClick={onCreateResource}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Resource
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
