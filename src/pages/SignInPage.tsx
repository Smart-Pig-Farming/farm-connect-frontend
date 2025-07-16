import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { Notification } from "@/components/ui/notification";

interface SignInData {
  email: string;
  password: string;
}

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<SignInData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

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

  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
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
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically submit the form data to your backend
      console.log("Sign in attempt:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success notification
      setNotification({
        show: true,
        type: "success",
        title: "Welcome back!",
        message: "You have been successfully signed in.",
      });

      // On successful sign in, navigate to intended destination or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Sign in error:", error);
      setErrors({ email: "Invalid credentials. Please try again." });
      setNotification({
        show: true,
        type: "error",
        title: "Sign In Failed",
        message: "Invalid credentials. Please check your email and password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid()) {
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
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                  errors.password ? "border-red-400 bg-red-500/10" : ""
                }`}
                placeholder="Enter your password"
              />
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
              disabled={!isFormValid() || isLoading}
              className={`w-full py-3 font-semibold transition-all duration-300 ${
                isFormValid() && !isLoading
                  ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}
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

      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </HeroBackground>
  );
};

export default SignInPage;
