// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // ✅ Navigate to OTP page with email
  const handleEmailContinue = () => {
    if (!email.trim()) return alert("Please enter your email");
    navigate("/otp", { state: { email } });
  };

  // ✅ Simulate Google login (for now navigate to OTP)
  const handleGoogleLogin = () => {
    alert("Google Sign-in clicked! (Demo: Navigate to OTP page)");
    navigate("/otp", { state: { email: "googleuser@example.com" } });
  };

  // ✅ Simulate Apple login (for now navigate to OTP)
  const handleAppleLogin = () => {
    alert("Apple Sign-in clicked! (Demo: Navigate to OTP page)");
    navigate("/otp", { state: { email: "appleuser@example.com" } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <img
          src="https://clockify.me/assets/images/brand/clockify-logo.svg"
          alt="Clockify"
          className="mx-auto mb-6 h-8"
        />
        <h2 className="text-xl font-semibold mb-4">Get started with Clockify</h2>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border py-2 rounded mb-3 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="Google"
            className="h-5"
          />
          Continue with Google
        </button>

        {/* Continue with Apple */}
        <button
          onClick={handleAppleLogin}
          className="w-full bg-white border py-2 rounded mb-6 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/0/747.png"
            alt="Apple"
            className="h-5"
          />
          Continue with Apple
        </button>

        <p className="text-gray-400 mb-2">OR</p>

        {/* Email input */}
        <input
          type="email"
          placeholder="name@work-email.com"
          className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Continue with Email */}
        <button
          onClick={handleEmailContinue}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Continue with email
        </button>

        <p className="mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/otp", { state: { email } })}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
