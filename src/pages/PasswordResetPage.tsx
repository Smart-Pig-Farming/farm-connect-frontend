import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { CheckIcon } from "@/components/ui/icons";
import { useResetPasswordMutation } from "@/store/api/authApi";

interface PasswordResetData {
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState<PasswordResetData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<PasswordResetData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if missing required params
  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Lowercase letter");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Uppercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback = feedback.filter((f) => f !== "Special character");
    } else if (score > 3) {
      feedback.push("Special character (optional)");
    }

    return { score, feedback };
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return "Weak";
    if (score === 3) return "Fair";
    if (score === 4) return "Good";
    return "Strong";
  };

  // Validation function
  const validateForm = () => {
    const formErrors: Partial<PasswordResetData> = {};

    if (!formData.newPassword) {
      formErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      formErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      formErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      formErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    return formErrors;
  };

  const handleInputChange = (field: keyof PasswordResetData, value: string) => {
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
      const firstErrorField = Object.keys(
        formErrors
      )[0] as keyof PasswordResetData;
      const fieldElement = document.getElementById(firstErrorField);
      if (fieldElement) {
        fieldElement.focus();
      }

      // Show a general toast for immediate feedback
      toast.error("Please fix the errors below to continue");
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading("Resetting password...", {
      description: "Please wait while we update your password.",
    });

    try {
      // Call the API
      await resetPassword({
        resetToken: token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show success toast
      toast.success("Password reset successful!", {
        description:
          "Your password has been updated. Redirecting to sign in...",
        duration: 4000,
      });

      // Show success state
      setShowSuccess(true);

      // After a delay, navigate to sign in
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      let errorMessage = "Password reset failed. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string } };
        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }
      }

      setErrors({ newPassword: errorMessage });
      toast.error("Password reset failed", {
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

  if (showSuccess) {
    return (
      <HeroBackground showParallax={false}>
        <div className="w-full max-w-md mx-auto px-4 py-8 min-h-screen flex items-center overflow-y-auto">
          <Card className="bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 p-8 rounded-2xl w-full mt-24 mb-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Password Reset Complete!
                </h1>
                <p className="text-white/80">
                  Your password has been successfully updated. You can now sign
                  in with your new password.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Redirecting you to sign in...</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </HeroBackground>
    );
  }

  return (
    <HeroBackground showParallax={false}>
      <div className="w-full max-w-md mx-auto px-4 py-8 min-h-screen flex items-center overflow-y-auto">
        <Card className="bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 p-8 rounded-2xl w-full mt-24 mb-8">
          {/* Success Notice */}
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-green-400 font-semibold text-sm mb-1">
                  Verification Successful
                </h3>
                <p className="text-green-200 text-xs leading-relaxed">
                  Your identity has been verified. Please set a new secure
                  password for your account.
                </p>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Set New Password
            </h1>
            <p className="text-white/80">
              Create a strong password for your account
            </p>
          </div>

          {/* Password Reset Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.newPassword ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Create a secure password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/70">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        getPasswordStrength(formData.newPassword).score <= 2
                          ? "text-red-400"
                          : getPasswordStrength(formData.newPassword).score ===
                            3
                          ? "text-yellow-400"
                          : getPasswordStrength(formData.newPassword).score ===
                            4
                          ? "text-orange-400"
                          : "text-green-400"
                      }`}
                    >
                      {getStrengthText(
                        getPasswordStrength(formData.newPassword).score
                      )}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
                        getPasswordStrength(formData.newPassword).score
                      )}`}
                      style={{
                        width: `${
                          (getPasswordStrength(formData.newPassword).score /
                            5) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Requirements */}
                  {getPasswordStrength(formData.newPassword).feedback.length >
                    0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-white/60">
                        Missing requirements:
                      </p>
                      <ul className="text-xs text-white/50 space-y-0.5">
                        {getPasswordStrength(formData.newPassword).feedback.map(
                          (requirement, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-1"
                            >
                              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                              <span>{requirement}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                    errors.confirmPassword ? "border-red-400 bg-red-500/10" : ""
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset Password Button */}
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
                  Updating Password...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">🔒</span>
                </div>
                <div>
                  <p className="text-blue-200 text-xs leading-relaxed">
                    Your new password will be securely encrypted. Make sure to
                    remember it for future logins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </HeroBackground>
  );
};

export default PasswordResetPage;
