"use client"; // Ensure this is at the top

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Correct import for Next.js App Router

// Define AuthContext
const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = typeof window !== "undefined" ? useRouter() : null; // ✅ Prevent SSR issues

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        setUser({ token });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
