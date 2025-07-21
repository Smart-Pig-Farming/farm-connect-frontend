import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

interface Permission {
  id: number;
  action: string;
  resource: string;
  name: string; // Action:Resource format
  description: string;
}

// Types
interface ComponentRole {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  role?: ComponentRole | null;
  mode: "create" | "edit";
  availablePermissions: Permission[];
}

export function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  mode,
  availablePermissions,
}: RoleFormModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when role changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: [],
      });
    }
    setErrors({});
  }, [role, mode, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionName]
        : prev.permissions.filter((p) => p !== permissionName),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 break-words pr-4">
              {mode === "create"
                ? "Create New Role"
                : `Edit Role: ${role?.name}`}
            </h3>
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
          <div className="space-y-6">
            {/* Role Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1 break-words"
              >
                Role Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter role name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 break-words">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1 break-words"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe the role and its responsibilities"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 break-words">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 break-words">
                Permissions *
              </label>
              <div
                className={`border rounded-lg p-4 max-h-60 overflow-y-auto ${
                  errors.permissions ? "border-red-500" : "border-gray-300"
                }`}
              >
                {availablePermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start mb-3 last:mb-0 hover:cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.name)}
                      onChange={(e) =>
                        handlePermissionChange(
                          permission.name,
                          e.target.checked
                        )
                      }
                      className="mt-1 mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                      <div className="text-sm text-gray-600">
                        {permission.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.permissions && (
                <p className="mt-1 text-sm text-red-600 break-words">
                  {errors.permissions}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 break-words">
                Selected: {formData.permissions.length} permission
                {formData.permissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer order-2 sm:order-1 break-words"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2 break-words"
            >
              {mode === "create" ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="break-words">Create Role</span>
                </>
              ) : (
                <span className="break-words">Update Role</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
