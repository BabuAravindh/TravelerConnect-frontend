"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const GuideSignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guide/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json(); // parse response
  
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Login failed";
        setError(errorMsg);
      
        return;
      }
  
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      router.push("/");
    } catch (err: any) {
      const fallbackMsg = err?.message || "Something went wrong";
      setError(fallbackMsg);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-primary p-6">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Guide Sign In</h1>
          {error && <p className="bg-red-500 text-white p-2 text-center rounded-md mb-4">{error}</p>}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="Enter your email"
                className={`mt-2 w-full p-3 border rounded-lg focus:ring-blue-500 shadow-sm ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="Enter your password"
                className={`mt-2 w-full p-3 border rounded-lg focus:ring-blue-500 shadow-sm ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <p className="text-right">
              <Link href="/verify" className="text-indigo-500">
                Forgot password?
              </Link>
            </p>

            <button
              type="submit"
              className="w-full bg-button hover:bg-opacity-80 text-white font-semibold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-4 text-button">
            New guide? {" "}
            <Link href="/guides/signup" className="text-primary font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GuideSignIn;
