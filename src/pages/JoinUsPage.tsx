import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import { locationData } from "@/data/location";
import { useRegisterFarmerMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

interface FormData {
  // Personal Information
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Organization Details
  farmName: string;
  province: string;
  district: string;
  sector: string;
  field: string;
}

const JoinUsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerFarmer, { isLoading: isRegistering }] =
    useRegisterFarmerMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    province: "",
    district: "",
    sector: "",
    field: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

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

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const stepErrors: Partial<FormData> = {};
    if (!formData.firstname.trim())
      stepErrors.firstname = "First name is required";
    if (!formData.lastname.trim())
      stepErrors.lastname = "Last name is required";
    if (!formData.email.trim()) {
      stepErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      stepErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      stepErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      stepErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      stepErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = "Passwords do not match";
    }

    return stepErrors;
  };

  const validateStep2 = () => {
    const stepErrors: Partial<FormData> = {};

    if (!formData.farmName.trim())
      stepErrors.farmName = "Farm name is required";
    if (!formData.province.trim()) stepErrors.province = "Province is required";
    if (!formData.district.trim()) stepErrors.district = "District is required";
    if (!formData.sector.trim()) stepErrors.sector = "Sector is required";

    return stepErrors;
  };

  const isStep1Valid = () => {
    const stepErrors = validateStep1();
    return Object.keys(stepErrors).length === 0;
  };

  const isStep2Valid = () => {
    const stepErrors = validateStep2();
    return Object.keys(stepErrors).length === 0;
  };

  const isFormValid = () => {
    return isStep1Valid() && isStep2Valid();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleNext = () => {
    const stepErrors = validateStep1();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error("Please fix the errors", {
        description: "Complete all required fields before proceeding.",
        duration: 3000,
      });
      return;
    }
    setCurrentStep(2);
    toast.success("Step 1 completed!", {
      description: "Now let's add your farm information.",
      duration: 2000,
    });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const allErrors = { ...step1Errors, ...step2Errors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1);
        toast.error("Please complete Step 1", {
          description: "Fill in all required personal information fields.",
          duration: 3000,
        });
      } else {
        toast.error("Please complete Step 2", {
          description: "Fill in all required farm information fields.",
          duration: 3000,
        });
      }
      return;
    }

    let loadingToastId: string | number | undefined;

    try {
      // Show loading toast
      loadingToastId = toast.loading("Creating your account...", {
        description: "Please wait while we set up your farmer profile.",
      });

      // Prepare data for API
      const registrationData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName,
        province: formData.province,
        district: formData.district,
        sector: formData.sector,
        field: formData.field || undefined,
      };

      // Register farmer
      const response = await registerFarmer(registrationData).unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        })
      );

      // Store token in localStorage for persistence
      localStorage.setItem("token", response.data.token);

      // Show success toast
      toast.success("Welcome to FarmConnect!", {
        description:
          "Your account has been created successfully. Redirecting to dashboard...",
        duration: 3000,
      });

      // On successful registration, navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);

      // Dismiss loading toast if it was created
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      // Extract error message and details
      let errorMessage = "Something went wrong. Please try again.";
      let errorDescription = "";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as {
          data?: {
            error?: string;
            details?: Array<{ msg: string; path: string }>;
          };
        };

        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }

        // If there are validation details, show the first few
        if (errorData.data?.details && errorData.data.details.length > 0) {
          const firstErrors = errorData.data.details.slice(0, 3);
          errorDescription = firstErrors.map((detail) => detail.msg).join(", ");
          if (errorData.data.details.length > 3) {
            errorDescription += "...";
          }
        }
      }

      // Show error toast
      toast.error(errorMessage, {
        description:
          errorDescription || "Please check your information and try again.",
        duration: 6000,
      });
    }
  };

  return (
    <HeroBackground showParallax={false}>
      <div className="w-full max-w-lg mx-auto px-4 py-8 min-h-screen flex items-center overflow-y-auto">
        <Card className="bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 p-8 rounded-2xl w-full mt-28 mb-8">
          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= 1
                      ? "bg-orange-500 text-white"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  {currentStep > 1 ? <CheckIcon className="w-5 h-5" /> : "1"}
                </div>
                <span className="ml-2 text-sm font-medium text-white/90">
                  Personal Info
                </span>
              </div>

              {/* Connector */}
              <div
                className={`w-12 h-0.5 ${
                  currentStep > 1 ? "bg-orange-500" : "bg-white/20"
                }`}
              ></div>

              {/* Step 2 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= 2
                      ? "bg-orange-500 text-white"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-white/90">
                  Farm Details
                </span>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Join Our Community
            </h1>
            <p className="text-white/80">
              {currentStep === 1
                ? "Let's start with your personal information"
                : "Tell us about your farming operation"}
            </p>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                      errors.firstname ? "border-red-400 bg-red-500/10" : ""
                    }`}
                    placeholder="John"
                  />
                  {errors.firstname && (
                    <p className="mt-1 text-sm text-red-300">
                      {errors.firstname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) =>
                      handleInputChange("lastname", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                      errors.lastname ? "border-red-400 bg-red-500/10" : ""
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-sm text-red-300">
                      {errors.lastname}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.email ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-300">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.password ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Enter a secure password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-300">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.confirmPassword ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-300">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                onClick={handleNext}
                className={`w-full py-3 font-semibold transition-all duration-300 ${
                  isStep1Valid()
                    ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isStep1Valid()}
              >
                Next Step
              </Button>
            </div>
          )}

          {/* Step 2: Organization Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) =>
                    handleInputChange("farmName", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.farmName ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Green Valley Farm"
                />
                {errors.farmName && (
                  <p className="mt-1 text-sm text-red-300">{errors.farmName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Province
                </label>
                <select
                  value={formData.province}
                  onChange={(e) =>
                    handleLocationChange("province", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white ${
                    errors.province ? "border-red-400 bg-red-500/10" : ""
                  }`}
                >
                  <option value="" className="bg-gray-800 text-white">
                    Select your province
                  </option>
                  {getProvinces().map((province) => (
                    <option
                      key={province}
                      value={province}
                      className="bg-gray-800 text-white"
                    >
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-300">{errors.province}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) =>
                    handleLocationChange("district", e.target.value)
                  }
                  disabled={!formData.province}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.district ? "border-red-400 bg-red-500/10" : ""
                  }`}
                >
                  <option value="" className="bg-gray-800 text-white">
                    {formData.province
                      ? "Select your district"
                      : "Select province first"}
                  </option>
                  {getDistricts(formData.province).map((district) => (
                    <option
                      key={district}
                      value={district}
                      className="bg-gray-800 text-white"
                    >
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-300">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) =>
                    handleLocationChange("sector", e.target.value)
                  }
                  disabled={!formData.province || !formData.district}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.sector ? "border-red-400 bg-red-500/10" : ""
                  }`}
                >
                  <option value="" className="bg-gray-800 text-white">
                    {formData.province && formData.district
                      ? "Select your sector"
                      : "Select district first"}
                  </option>
                  {getSectors(formData.province, formData.district).map(
                    (sector) => (
                      <option
                        key={sector}
                        value={sector}
                        className="bg-gray-800 text-white"
                      >
                        {sector}
                      </option>
                    )
                  )}
                </select>
                {errors.sector && (
                  <p className="mt-1 text-sm text-red-300">{errors.sector}</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-3 font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleSubmit}
                  className={`flex-1 py-3 font-semibold transition-all duration-300 ${
                    isFormValid() && !isRegistering
                      ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                      : "bg-white/20 text-white/60 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid() || isRegistering}
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>
          )}

          {/* Back to Home Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-white/70 hover:text-orange-400 transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </Card>
      </div>
    </HeroBackground>
  );
};

export default JoinUsPage;
