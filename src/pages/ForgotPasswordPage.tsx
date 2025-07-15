import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface ForgotPasswordData {
  email: string;
}

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
  });

  const [errors, setErrors] = useState<Partial<ForgotPasswordData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation function
  const validateForm = () => {
    const formErrors: Partial<ForgotPasswordData> = {};

    if (!formData.email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "Please enter a valid email";
    }

    return formErrors;
  };

  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ForgotPasswordData,
    value: string
  ) => {
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
      // Here you would typically submit the email to your backend
      console.log("Password reset request:", formData.email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to OTP verification page with email
      navigate(
        `/forgot-password/verify?email=${encodeURIComponent(formData.email)}`
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({ email: "Unable to send reset email. Please try again." });
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
          {/* Info Notice */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold text-sm mb-1">
                  Password Reset
                </h3>
                <p className="text-blue-200 text-xs leading-relaxed">
                  Enter your email address and we'll send you a verification
                  code to reset your password.
                </p>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-white/80">
              No worries! We'll help you reset it in just a few steps.
            </p>
          </div>

          {/* Reset Form */}
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
                placeholder="Enter your registered email"
                autoFocus
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-white/60">
                We'll send a 6-digit verification code to this email
              </p>
            </div>

            {/* Send Code Button */}
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
                  Sending Code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/20 text-white/70">
                  Remember your password?
                </span>
              </div>
            </div>

            {/* Back to Sign In */}
            <Button
              onClick={() => navigate("/signin")}
              variant="outline"
              className="w-full py-3 font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          {/* Support Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70 mb-2">Still having trouble?</p>
            <button
              onClick={() => {
                /* Handle support contact */
              }}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </Card>
      </div>
    </HeroBackground>
  );
};

export default ForgotPasswordPage;
