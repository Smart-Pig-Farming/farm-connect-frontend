import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  description: string;
}

interface ResourceFormData {
  name: string;
  description: string;
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => void;
  resource?: Resource | null;
  mode: "create" | "edit";
}

export function ResourceFormModal({
  isOpen,
  onClose,
  onSubmit,
  resource,
  mode,
}: ResourceFormModalProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when resource changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && resource) {
      setFormData({
        name: resource.name,
        description: resource.description,
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
    setErrors({});
  }, [resource, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Resource name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Resource name must be at least 2 characters";
    } else if (!/^[a-z_]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Resource name must be lowercase letters and underscores only";
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
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 break-words pr-4">
              {mode === "create"
                ? "Create New Resource"
                : `Edit Resource: ${resource?.name}`}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resource Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 break-words">
              Resource Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., users, content, discussions"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 break-words">
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 break-words">
              Use lowercase letters and underscores only (e.g., farm_data)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 break-words">
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
              placeholder="Describe what this resource represents in the system..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 break-words">
                {errors.description}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer order-2 sm:order-1 break-words"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:cursor-pointer order-1 sm:order-2 break-words"
            >
              {mode === "create" ? "Create Resource" : "Update Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
