import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { locationData } from "@/data/location";

// Types - Updated to match backend structure
interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  organization?: string;
  sector?: string;
  district?: string;
  province?: string;
  is_verified: boolean;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  level?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password?: string; // Optional for create mode (auto-generated)
  confirmPassword?: string; // Optional for create mode
  farmName: string;
  province: string;
  district: string;
  sector: string;
  role: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
  mode: "create" | "edit";
  isLoading?: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
  isLoading = false,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    province: "",
    district: "",
    sector: "",
    role: "",
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: "",
        confirmPassword: "",
        farmName: user.organization || "",
        province: user.province || "",
        district: user.district || "",
        sector: user.sector || "",
        role: user.role.name, // Use the actual database role name directly
      });
    } else if (mode === "create") {
      resetForm();
    }
  }, [mode, user, isOpen]);

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      farmName: "",
      province: "",
      district: "",
      sector: "",
      role: "",
    });
  };

  // Helper functions for location data
  const getProvinces = () => Object.keys(locationData);

  const getDistricts = (province: string) => {
    return province
      ? Object.keys(locationData[province as keyof typeof locationData] || {})
      : [];
  };

  const getSectors = (province: string, district: string) => {
    if (!province || !district) return [];
    const provinceData = locationData[province as keyof typeof locationData];
    return provinceData
      ? provinceData[district as keyof typeof provinceData] || []
      : [];
  };

  // Handle form field changes
  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle location field changes
  const handleLocationChange = (
    field: "province" | "district" | "sector",
    value: string
  ) => {
    if (field === "province") {
      setFormData((prev) => ({
        ...prev,
        province: value,
        district: "",
        sector: "",
      }));
    } else if (field === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        sector: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sector: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (mode === "create") {
      resetForm();
    }
  };

  const handleClose = () => {
    if (mode === "create") {
      resetForm();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold break-words pr-4">
            {mode === "create" ? "Create New User" : "Edit User"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2 break-words">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) =>
                    handleFormChange("firstname", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => handleFormChange("lastname", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            {mode === "create" && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-800">
                      Temporary Password
                    </h4>
                    <p className="text-sm text-orange-700 mt-1">
                      A temporary password will be generated automatically and
                      sent to the user via email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organization Details Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2 break-words">
              Farm/Organization Details
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm/Organization Name
              </label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => handleFormChange("farmName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Green Valley Farm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                  Province
                </label>
                <div className="relative">
                  <select
                    value={formData.province}
                    onChange={(e) =>
                      handleLocationChange("province", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Select Province</option>
                    {getProvinces().map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) =>
                    handleLocationChange("district", e.target.value)
                  }
                  disabled={!formData.province}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.province
                      ? "Select District"
                      : "Select province first"}
                  </option>
                  {getDistricts(formData.province).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 break-words">
                  Sector
                </label>
                <div className="relative">
                  <select
                    value={formData.sector}
                    onChange={(e) =>
                      handleLocationChange("sector", e.target.value)
                    }
                    disabled={!formData.province || !formData.district}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">
                      {formData.province && formData.district
                        ? "Select Sector"
                        : "Select district first"}
                    </option>
                    {getSectors(formData.province, formData.district).map(
                      (sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Role Assignment Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2 break-words">
              Role Assignment
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleFormChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="vet">Veterinarian</option>
                <option value="govt">Government Official</option>
                <option value="farmer">Farmer</option>
              </select>
              <p className="text-sm text-gray-500 mt-1 break-words">
                Select the appropriate role for this user. This determines their
                permissions and access level.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-4 py-2 border border-gray-300 rounded-lg order-2 sm:order-1 break-words ${
                isLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg order-1 sm:order-2 break-words flex items-center gap-2 justify-center ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              } text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
