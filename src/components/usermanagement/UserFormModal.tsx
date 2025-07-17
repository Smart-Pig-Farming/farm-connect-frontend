import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { locationData } from "@/data/location";

// Types
interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  isLocked: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
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
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
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
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        password: "",
        confirmPassword: "",
        farmName: "", // Would need to be fetched from user data
        province: "",
        district: "",
        sector: "",
        role: user.role,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === "create" ? "Create New User" : "Edit User"}
          </h3>
          <button onClick={handleClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter secure password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFormChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Organization Details Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  value={formData.province}
                  onChange={(e) =>
                    handleLocationChange("province", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Province</option>
                  {getProvinces().map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) =>
                    handleLocationChange("sector", e.target.value)
                  }
                  disabled={!formData.province || !formData.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Role Assignment Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
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
                <option value="administrator">Administrator</option>
                <option value="veterinarian">Veterinarian</option>
                <option value="government">Government Official</option>
                <option value="farmer">Farmer</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select the appropriate role for this user. This determines their
                permissions and access level.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {mode === "create" ? "Create User" : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
