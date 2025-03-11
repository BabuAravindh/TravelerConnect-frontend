import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string; // Ensure your backend sends this
  user: string;
  role: string;
  iat: number;
  exp: number;
}

const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          setUserId(decoded.id); // Extract userId
          setUserName(decoded.user);
          setUserRole(decoded.role);
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          setUserId(null);
          setUserName(null);
          setUserRole(null);
        }
      } else {
        setUserId(null);
        setUserName(null);
        setUserRole(null);
      }
    };

    fetchUserData();
    const handleStorageChange = () => fetchUserData();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { userId, userName, userRole };
};

export default useAuth;
