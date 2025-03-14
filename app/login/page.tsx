"use client";

import { useState } from "react";
import Link from "next/link";
import useLogin from "@/hooks/useLogin";
import toast from "react-hot-toast";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { error, isUnverified, handleLogin } = useLogin();

  const validateForm = () => {
    const newErrors = { email: "", password: "" }; // ✅ Changed `let` to `const`
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
    } else if (password.length < 6) { // ✅ Fixed password length check (previously < 4)
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      handleLogin(email, password);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resendverification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error(data.error || "Failed to resend verification email.");
      }
    } catch {
      toast.error("Something went wrong. Please try again."); // ✅ Removed unused `err`
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Sign In</h1>

        {/* Display error messages */}
        {error && (
          <p
            className={`p-2 text-center rounded-md mb-4 ${
              isUnverified ? "bg-yellow-500 text-gray-900" : "bg-red-500 text-white"
            }`}
          >
            {error}
          </p>
        )}

        {/* Resend Verification Email Button */}
        {isUnverified && (
          <div className="flex justify-center">
            <button
              onClick={resendVerificationEmail}
              className="mt-3 px-4 py-2 bg-button text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" })); // ✅ Used functional update for `setErrors`
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
                setErrors((prev) => ({ ...prev, password: "" })); // ✅ Used functional update for `setErrors`
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
          New to this website?{" "}
          <Link href="/signup" className="text-primary font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
