"use client"; // ✅ Ensure this file runs on the client side only

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowGuest = false }: { children: React.ReactNode, allowGuest?: boolean }) => {
  const { user } = useAuth();
  const router = typeof window !== "undefined" ? useRouter() : null; // ✅ Prevents SSR issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user && !allowGuest && router) {
      router.push("/login");
    }
  }, [user, allowGuest, router]);

  if (!isClient) return null; // ✅ Prevents rendering during SSR

  if (!user && !allowGuest) {
    return null; // Hide children while redirecting
  }

  return <>{children}</>;
};

export default ProtectedRoute;
