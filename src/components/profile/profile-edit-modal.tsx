import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelector } from "@/components/ui/location-selector";

interface ProfileEditData {
  firstname: string;
  lastname: string;
  email: string;
  province: string;
  district: string;
  sector: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileEditData) => void;
  initialData: ProfileEditData;
  isLoading?: boolean;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileEditData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleLocationChange = (location: {
    province: string;
    district: string;
    sector: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...location,
    }));
  };

  const handleClose = () => {
    // Reset form to initial data when closing
    setFormData(initialData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl mx-4 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <Save className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstname"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="firstname"
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstname: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className={`${
                      errors.firstname
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "focus:border-orange-500 focus:ring-orange-500"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstname && (
                    <p className="text-sm text-red-500">{errors.firstname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastname"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </Label>
                  <Input
                    id="lastname"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastname: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className={`${
                      errors.lastname
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "focus:border-orange-500 focus:ring-orange-500"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastname && (
                    <p className="text-sm text-red-500">{errors.lastname}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={isLoading}
                  className={`${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Location Information
              </h4>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <LocationSelector
                  province={formData.province}
                  district={formData.district}
                  sector={formData.sector}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
