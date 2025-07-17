import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

interface PermissionFormData {
  action: string;
  resource: string;
  description: string;
}

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PermissionFormData) => void;
  permission?: Permission | null;
  mode: "create" | "edit";
  availableActions: Action[];
  availableResources: Resource[];
}

export function PermissionFormModal({
  isOpen,
  onClose,
  onSubmit,
  permission,
  mode,
  availableActions,
  availableResources,
}: PermissionFormModalProps) {
  const [formData, setFormData] = useState<PermissionFormData>({
    action: "",
    resource: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when permission changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && permission) {
      setFormData({
        action: permission.action,
        resource: permission.resource,
        description: permission.description,
      });
    } else {
      setFormData({
        action: "",
        resource: "",
        description: "",
      });
    }
    setErrors({});
  }, [permission, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.action) {
      newErrors.action = "Please select an action";
    }

    if (!formData.resource) {
      newErrors.resource = "Please select a resource";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      action: formData.action,
      resource: formData.resource,
      description: formData.description.trim(),
    });
  };

  const handleClose = () => {
    setFormData({
      action: "",
      resource: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  const getPermissionName = () => {
    if (formData.action && formData.resource) {
      return `${formData.action}:${formData.resource}`;
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === "create"
                ? "Create New Permission"
                : `Edit Permission: ${permission?.name}`}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Permission Preview */}
          {getPermissionName() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Permission Name Preview
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {getPermissionName()}
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {formData.action}
                  </span>
                  <span className="text-gray-400">:</span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {formData.resource}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action *
            </label>
            <select
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.action ? "border-red-500" : "border-gray-300"
              }`}
              disabled={mode === "edit"}
            >
              <option value="">Select an action...</option>
              {availableActions.map((action) => (
                <option key={action.id} value={action.name}>
                  {action.name} - {action.description}
                </option>
              ))}
            </select>
            {errors.action && (
              <p className="mt-1 text-sm text-red-600">{errors.action}</p>
            )}
            {mode === "edit" && (
              <p className="mt-1 text-sm text-gray-500">
                Action cannot be changed when editing a permission
              </p>
            )}
          </div>

          {/* Resource Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource *
            </label>
            <select
              value={formData.resource}
              onChange={(e) =>
                setFormData({ ...formData, resource: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.resource ? "border-red-500" : "border-gray-300"
              }`}
              disabled={mode === "edit"}
            >
              <option value="">Select a resource...</option>
              {availableResources.map((resource) => (
                <option key={resource.id} value={resource.name}>
                  {resource.name} - {resource.description}
                </option>
              ))}
            </select>
            {errors.resource && (
              <p className="mt-1 text-sm text-red-600">{errors.resource}</p>
            )}
            {mode === "edit" && (
              <p className="mt-1 text-sm text-gray-500">
                Resource cannot be changed when editing a permission
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe what this permission allows users to do with the selected resource..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:cursor-pointer"
            >
              {mode === "create" ? "Create Permission" : "Update Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
