"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const useLogin = () => {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setError("");

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);

      router.push("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return { error, handleLogin };
};

export default useLogin;
