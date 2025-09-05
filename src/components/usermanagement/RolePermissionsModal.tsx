import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface Permission {
  id: number;
  action: string;
  resource: string;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleId: number, permissionIds: number[]) => void;
  role?: Role | null;
  availablePermissions: Permission[];
  currentPermissions: Permission[];
}

export function RolePermissionsModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  availablePermissions,
  currentPermissions,
}: RolePermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Update selected permissions when role changes
  useEffect(() => {
    if (role && currentPermissions) {
      setSelectedPermissions(currentPermissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [role, currentPermissions, isOpen]);

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      onSubmit(role.id, selectedPermissions);
    }
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    onClose();
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 break-words pr-4">
                Manage Permissions: {role.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select the permissions for this role
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:cursor-pointer flex-shrink-0"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Permission Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Available Permissions
                </label>
                <div className="text-sm text-gray-500">
                  Selected: {selectedPermissions.length} of{" "}
                  {availablePermissions.length}
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start hover:cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mt-1 mr-3 text-orange-600 focus:ring-orange-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {permission.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              {permission.action}
                            </span>
                            <span className="text-gray-400">:</span>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {permission.resource}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 break-words">
                          {permission.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Permission Summary
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPermissions.length > 0 ? (
                  selectedPermissions.map((permissionId) => {
                    const permission = availablePermissions.find(
                      (p) => p.id === permissionId
                    );
                    return permission ? (
                      <span
                        key={permissionId}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded border"
                      >
                        {permission.name}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-sm text-gray-500">
                    No permissions selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Permissions</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
