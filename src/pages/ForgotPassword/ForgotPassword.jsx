import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Read token and email from URL
  const params = new URLSearchParams(location.search);
  const urlToken = params.get("token");
  const urlEmail = params.get("email");

  useEffect(() => {
    if (urlEmail) setEmail(urlEmail);
  }, [urlEmail]);

  // Step 1: Request token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("/api/Mail/forgot-password", { email });
      // Assume the API returns { token: "..." } on success
      const token = res.data?.token;
      if (token) {
        navigate(
          `/forgot-password?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`
        );
      } else {
        setMessage("If your email exists, you'll receive a reset token.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "https://ecofy.salmonpond-551ebfc8.italynorth.azurecontainerapps.io/api/Mail/reset-password",
        {
          email,
          token: urlToken,
          newPassword,
        }
      );
      setMessage(
        "Your password has been reset! You can now log in with your new password."
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Forgot Password
        </h2>
        {message && <div className="mb-4 text-green-400">{message}</div>}
        {error && <div className="mb-4 text-red-400">{error}</div>}
        {!urlToken ? (
          <form onSubmit={handleRequestToken}>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 mb-4 rounded bg-[#2A2A2A] text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label className="block text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-[#2A2A2A] text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-[#2A2A2A] text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
