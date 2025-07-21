import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

interface SignInData {
  email: string;
  password: string;
}

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<SignInData>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Get the redirect path if user was redirected from protected route
  const from = location.state?.from?.pathname || "/dashboard";

  // Validation function
  const validateForm = () => {
    const formErrors: Partial<SignInData> = {};

    if (!formData.email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      formErrors.password = "Password is required";
    }

    return formErrors;
  };

  const handleInputChange = (field: keyof SignInData, value: string) => {
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

  const handleSubmit = async () => {
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      // Focus the first field with an error for better UX
      const firstErrorField = Object.keys(formErrors)[0] as keyof SignInData;
      const fieldElement = document.getElementById(firstErrorField);
      if (fieldElement) {
        fieldElement.focus();
      }

      // Show a general toast for immediate feedback
      toast.error("Please fix the errors below to continue");
      return;
    }

    let loadingToastId: string | number | undefined;

    try {
      // Show loading toast
      loadingToastId = toast.loading("Signing you in...", {
        description: "Please wait while we verify your credentials.",
      });

      // Attempt login
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Store user data in Redux (authentication is handled by HttpOnly cookies)
      dispatch(
        setCredentials({
          user: response.data.user,
        })
      );

      // Show success toast
      toast.success("Welcome back!", {
        description: `Hello ${response.data.user.firstname}! Redirecting to your dashboard...`,
        duration: 3000,
      });

      // Determine redirect path based on user role
      let redirectPath = from;
      if (from === "/dashboard") {
        // All users should land on the Overview page by default
        redirectPath = "/dashboard/overview";
      }

      console.log("Navigating to:", redirectPath);

      // Navigate to intended destination after a small delay to ensure Redux state is updated
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);

      // Dismiss loading toast if it was created
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      // Extract error message and determine error type
      let errorTitle = "Sign In Failed";
      let errorMessage = "Something went wrong. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string; code?: string } };

        if (errorData.data?.error) {
          errorMessage = errorData.data.error;

          // Handle specific error cases based on use case requirements
          switch (errorData.data.code) {
            case "INVALID_CREDENTIALS":
              errorTitle = "Invalid Credentials";
              errorMessage = "Invalid email or password.";
              setErrors({ email: "Invalid email or password" });
              break;

            case "ACCOUNT_LOCKED":
              errorTitle = "Account Locked";
              errorMessage =
                "Account is temporarily locked. Contact administrator.";
              break;

            case "ACCOUNT_NOT_VERIFIED":
              errorTitle = "Account Not Verified";
              errorMessage =
                "Your account requires verification. Redirecting to verification...";
              // TODO: Redirect to first-time login verification flow
              setTimeout(() => {
                navigate("/verify", { state: { email: formData.email } });
              }, 2000);
              break;

            default:
              break;
          }
        }
      }

      // Show error toast
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <HeroBackground showParallax={false}>
      <div className="w-full max-w-md mx-auto px-4 py-8 min-h-screen flex items-center overflow-y-auto">
        <Card className="bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 p-8 rounded-2xl w-full mt-24 mb-8">
          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80">
              Sign in to your FarmConnect account and continue your farming
              journey
            </p>
          </div>

          {/* Sign In Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.password ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-300">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-white/70 hover:text-orange-400 transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3 font-semibold transition-all duration-300 ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/20 text-white/70">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Join Us Button */}
            <Button
              onClick={() => navigate("/join")}
              variant="outline"
              className="w-full py-3 font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              Join Our Community
            </Button>
          </div>

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

export default SignInPage;
