import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { CheckIcon } from "@/components/ui/icons";

interface VerificationData {
  newPassword: string;
  confirmPassword: string;
}

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<VerificationData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<VerificationData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get email from navigation state
  const userEmail = location.state?.email;

  // Redirect if no email is provided
  useEffect(() => {
    if (!userEmail) {
      toast.error("Invalid access. Please login first.");
      navigate("/signin");
    }
  }, [userEmail, navigate]);

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
    const formErrors: Partial<VerificationData> = {};

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

  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (field: keyof VerificationData, value: string) => {
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
      // Check if we have the email from navigation state
      if (!userEmail) {
        toast.error("Session expired. Please login again.");
        navigate("/signin");
        return;
      }

      // Call backend API for verification
      const response = await fetch("/api/auth/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Store the token and user data
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Show success state
      setShowSuccess(true);
      toast.success("Account verified successfully!");

      // After a delay, navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again.";
      toast.error(errorMessage);
      setErrors({
        newPassword: errorMessage,
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
                  Verification Complete!
                </h1>
                <p className="text-white/80">
                  Your password has been successfully updated. You now have full
                  access to FarmConnect.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">
                    Redirecting you to the platform...
                  </span>
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
          {/* Warning Notice */}
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-orange-400 font-semibold text-sm mb-1">
                  Account Verification Required
                </h3>
                <p className="text-orange-200 text-xs leading-relaxed">
                  For security purposes, you must update your password before
                  accessing the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Verify Your Account
            </h1>
            <p className="text-white/80">
              Please set a new secure password to complete your verification
            </p>
          </div>

          {/* Verification Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                  errors.newPassword ? "border-red-400 bg-red-500/10" : ""
                }`}
                placeholder="Create a secure password"
              />

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
              <p className="mt-1 text-xs text-white/60">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                onKeyPress={handleKeyPress}
                onPaste={(e) => {
                  e.preventDefault();
                  return false;
                }}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-white/60 text-white ${
                  errors.confirmPassword ? "border-red-400 bg-red-500/10" : ""
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Verify Button */}
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
                  Verifying Account...
                </div>
              ) : (
                "Complete Verification"
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
                    Your new password will be securely encrypted and stored.
                    Make sure to remember it for future logins.
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

export default VerificationPage;
