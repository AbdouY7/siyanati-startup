import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../api/axios";
import OtpInput from "../../components/uiComponents/OtpInput";
import { FaEnvelope, FaSpinner } from "react-icons/fa";

const EmailVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(60);

  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If already verified, redirect to phone verification or home
    if (user?.email_verified) {
      navigate(user.phone_verified ? "/" : "/verify-phone");
    } else {
      // Send initial OTP
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email_verified, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.post("/auth/verify-email", { code: otp });
      setSuccess("Email verified successfully!");
      await checkAuth(); // Refresh user state
      navigate("/verify-phone"); // Go to next step
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.post("/auth/send-email-verification");
      setSuccess("A new verification code has been sent to your email.");
      setCountdown(60); // Reset timer
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  // Trigger initial send if they just landed (optional, but good UX if they didn't just register)
  // For safety against spam, we require user to click send if they want a new one, unless it's their first time.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 text-5xl mb-4">
          <FaEnvelope />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-900">
            {user?.email || "your email"}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || resendLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <span className="inline-flex items-center">
                    <FaSpinner className="animate-spin mr-1" /> Sending...
                  </span>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend Code"
                )}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
