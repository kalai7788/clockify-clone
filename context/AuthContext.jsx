import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext({});

// ✅ Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Use Vite env variables
  const isDemoMode =
    !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyBoahm1Y79jkqbkmcmvvaji06281BCzx0M";

  const demoUser = {
    uid: "kalai-demo",
    email: "skalaiyarasu0@gmail.com",
    displayName: "User",
    photoURL: null,
  };

  // ✅ Listen to auth state
  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  // ✅ Simulated login (OTP flow handles actual auth)
  const login = async (email) => {
    if (isDemoMode) {
      setUser({ ...demoUser, email });
      return { user: { ...demoUser, email } };
    }
    // In your OTP flow, you handle Firebase sign-in via link or custom token
    return { user: { email } };
  };

  // ✅ Simulated signup
  const signup = async (email, displayName) => {
    if (isDemoMode) {
      const newUser = { ...demoUser, displayName, email };
      setUser(newUser);
      return { user: newUser };
    }
    return { user: { email, displayName } }; // Real signup handled via OTP flow
  };

  // ✅ Logout
  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
