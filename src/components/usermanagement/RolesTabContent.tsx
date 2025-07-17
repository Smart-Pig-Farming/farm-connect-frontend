import { Shield, Plus, Edit } from "lucide-react";

// Types
interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface RolesTabContentProps {
  roles: Role[];
  onCreateRole: () => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export function RolesTabContent({
  roles,
  onCreateRole,
  onEditRole,
  onDeleteRole,
}: RolesTabContentProps) {
  return (
    <div className="p-3 sm:p-6 w-full min-w-0">
      {/* Roles Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold break-words">Role Management</h2>
          <p className="text-sm text-gray-600 mt-1 break-words">
            Manage system roles and their permissions
          </p>
        </div>
        <button
          onClick={onCreateRole}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
        >
          <Plus className="w-4 h-4" />
          <span className="break-words">Create Role</span>
        </button>
      </div>

      {/* Roles Grid - Desktop & Tablet */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
          >
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 flex-1 break-words">
                  {role.name}
                </h3>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full break-words">
                  {role.userCount} users
                </span>
              </div>
              <p className="text-sm text-gray-500 break-words">
                {role.description}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-500 block mb-2 break-words">
                Permissions ({role.permissions.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((permission, index) => {
                  const [action, resource] = permission.split(":");
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1"
                    >
                      <span className="text-xs bg-green-100 text-green-800 px-1 rounded break-words">
                        {action}
                      </span>
                      <span className="text-xs text-gray-400">:</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded break-words">
                        {resource}
                      </span>
                    </div>
                  );
                })}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded break-words">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEditRole(role)}
                className="flex-1 text-sm text-orange-600 border border-orange-600 px-3 py-2 rounded hover:bg-orange-50 hover:cursor-pointer transition-colors break-words"
              >
                <span className="break-words">Edit Role</span>
              </button>
              <button
                onClick={() => onDeleteRole(role)}
                className="flex-1 text-sm text-red-600 border border-red-600 px-3 py-2 rounded hover:bg-red-50 hover:cursor-pointer transition-colors break-words"
              >
                <span className="break-words">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roles List - Mobile */}
      <div className="md:hidden space-y-4 w-full">
        {roles.map((role) => (
          <div
            key={role.id}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm w-full min-w-0"
          >
            {/* Role Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg font-medium text-gray-900 break-words">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  {role.description}
                </p>
              </div>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full break-words">
                {role.userCount} users
              </span>
            </div>

            {/* Permissions Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Permissions
                </span>
                <span className="text-xs text-gray-500">
                  {role.permissions.length} total
                </span>
              </div>

              {/* First 2 permissions for mobile */}
              <div className="space-y-1">
                {role.permissions.slice(0, 2).map((permission, index) => {
                  const [action, resource] = permission.split(":");
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                    >
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium break-words">
                        {action}
                      </span>
                      <span className="text-gray-400">:</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium break-words">
                        {resource}
                      </span>
                    </div>
                  );
                })}
                {role.permissions.length > 2 && (
                  <div className="text-center py-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded break-words">
                      + {role.permissions.length - 2} more permissions
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <button
                  onClick={() => onEditRole(role)}
                  className="flex-1 text-sm text-orange-600 border border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 hover:cursor-pointer transition-colors flex items-center justify-center gap-2 break-words"
                >
                  <Edit className="w-4 h-4" />
                  <span className="break-words">Edit</span>
                </button>
                <button
                  onClick={() => onDeleteRole(role)}
                  className="flex-1 text-sm text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:cursor-pointer transition-colors flex items-center justify-center gap-2 break-words"
                >
                  <span className="break-words">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900 break-words">
            No roles found
          </p>
          <p className="text-sm text-gray-500 mb-4 break-words">
            Get started by creating your first role.
          </p>
          <button
            onClick={onCreateRole}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto break-words"
          >
            <Plus className="w-4 h-4" />
            <span className="break-words">Create Role</span>
          </button>
        </div>
      )}
    </div>
  );
}
