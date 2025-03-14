"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  name: string;  
  role: string;
  exp: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  hasRole: (role: string) => boolean;
  loading: boolean; // ✅ Ensure 'loading' is part of the context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = () => {
      setLoading(true); // Start loading
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠ No token found. User logged out.");
          setUser(null);
          return;
        }
  
        const decoded: DecodedToken = jwtDecode(token);
        console.log("✅ Decoded Token:", decoded);
  
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("⚠ Token expired, clearing localStorage");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);  // ✅ Persist user after refresh
        }
      } catch (error) {
        console.error("❌ Error decoding token:", error);
        setUser(null);
      } finally {
        setLoading(false); // ✅ Stop loading once checked
      }
    };
  
    loadUserFromToken();
  }, []);
  

  const hasRole = (role: string) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, hasRole, loading }}>
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
