// src/pages/Signup.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Signup() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [name, setName] = useState("");
  const [org, setOrg] = useState("");

  const handleSignup = async () => {
    if (!name || !org) return alert("Please fill all fields");

    await addDoc(collection(db, "users"), {
      email,
      name,
      organizer: org,
      createdAt: new Date(),
    });

    alert("Signup Complete!");
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <img
          src="https://clockify.me/assets/images/brand/clockify-logo.svg"
          alt="Clockify"
          className="mx-auto mb-6 h-8"
        />
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        <p className="text-gray-500 mb-4">{email}</p>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          placeholder="Organization Name"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
