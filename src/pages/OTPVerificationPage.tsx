import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/hero-background";
import { ArrowLeftIcon } from "@/components/ui/icons";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "@/store/api/authApi";

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (errors) {
      setErrors("");
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Enter" && isFormValid()) {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 4 && /^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const isFormValid = () => {
    return otp.every((digit) => digit !== "") && !isLoading;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setErrors("Please enter the complete 4-digit code");
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading("Verifying code...", {
      description: "Please wait while we verify your code.",
    });

    try {
      const otpCode = otp.join("");

      // Call the API
      const response = await verifyOtp({
        email,
        otp: otpCode,
      }).unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show success toast
      toast.success("Code verified successfully!", {
        description: "Redirecting to password reset...",
        duration: 3000,
      });

      // Navigate to password reset page with the reset token
      navigate(
        `/forgot-password/reset?token=${encodeURIComponent(
          response.data?.resetToken || ""
        )}`
      );
    } catch (error) {
      console.error("OTP verification error:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      let errorMessage = "Invalid verification code. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string } };
        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }
      }

      setErrors(errorMessage);
      toast.error("Verification failed", {
        description: errorMessage,
        duration: 5000,
      });

      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setErrors("");

    // Show loading toast
    const loadingToastId = toast.loading("Resending code...", {
      description: "Sending a new verification code to your email.",
    });

    try {
      // Call the API
      await resendOtp({ email }).unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show success toast
      toast.success("Code sent successfully!", {
        description: "A new verification code has been sent to your email.",
        duration: 4000,
      });

      // Reset timer
      setTimeLeft(300);
      setCanResend(false);

      // Clear current OTP
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      let errorMessage = "Failed to resend code. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string } };
        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }
      }

      setErrors(errorMessage);
      toast.error("Failed to resend code", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <HeroBackground showParallax={false}>
      <div className="w-full max-w-md mx-auto px-4 py-8 min-h-screen flex items-center overflow-y-auto">
        <Card className="bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 p-8 rounded-2xl w-full mt-24 mb-8">
          {/* Timer Notice */}
          <div
            className={`border rounded-xl p-4 mb-6 ${
              timeLeft <= 60
                ? "bg-red-500/20 border-red-400/30"
                : "bg-green-500/20 border-green-400/30"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  timeLeft <= 60 ? "bg-red-500" : "bg-green-500"
                }`}
              >
                <span className="text-white text-sm font-bold">⏱</span>
              </div>
              <div>
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    timeLeft <= 60 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {timeLeft <= 60
                    ? "Code Expiring Soon!"
                    : "Verification Code Sent"}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    timeLeft <= 60 ? "text-red-200" : "text-green-200"
                  }`}
                >
                  Code expires in:{" "}
                  <span className="font-mono font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Enter Verification Code
            </h1>
            <p className="text-white/80 mb-2">We've sent a 4-digit code to</p>
            <p className="text-orange-400 font-medium text-sm bg-white/10 px-3 py-1 rounded-lg inline-block">
              {email}
            </p>
          </div>

          {/* OTP Form */}
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-4 text-center">
                Verification Code
              </label>
              <div className="flex justify-center space-x-4 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-center text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                      errors ? "border-red-400 bg-red-500/10" : ""
                    }`}
                    autoComplete="off"
                  />
                ))}
              </div>
              {errors && (
                <p className="text-sm text-red-300 text-center">{errors}</p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full py-3 font-semibold transition-all duration-300 ${
                isFormValid()
                  ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying Code...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              {canResend ? (
                <Button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  {isResending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              ) : (
                <p className="text-sm text-white/60">
                  Didn't receive the code? You can resend in{" "}
                  {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Back Button */}
            <Button
              onClick={() => navigate("/forgot-password")}
              variant="outline"
              className="w-full py-3 font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Email Entry
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70 mb-2">
              Having trouble receiving the code?
            </p>
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

export default OTPVerificationPage;
