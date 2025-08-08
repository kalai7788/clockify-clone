import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function Otp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtp = async () => {
    const otpCode = generateOtp();

    // ✅ Save OTP to Firestore
    await setDoc(doc(collection(db, "otps"), email), {
      otp: otpCode,
      createdAt: serverTimestamp(),
    });

    alert(`OTP sent to ${email} (Simulated: ${otpCode})`);
    setOtpSent(true);
  };

  const verifyOtp = async () => {
    const snap = await getDoc(doc(collection(db, "otps"), email));
    if (!snap.exists()) return alert("OTP expired");
    if (snap.data().otp === otp) {
      navigate("/signup", { state: { email } });
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <img
          src="https://clockify.me/assets/images/brand/clockify-logo.svg"
          alt="Clockify"
          className="mx-auto mb-6 h-8"
        />
        <h2 className="text-xl font-semibold mb-4">
          Code received via email to verify your address
        </h2>

        {!otpSent ? (
          <button
            onClick={sendOtp}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send OTP to {email}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Verify & Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
