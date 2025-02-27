"use client";

import { useState } from "react";
import Link from "next/link";
import useLogin from "@/hooks/useLogin";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, handleLogin } = useLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Sign In</h1>

        {error && <p className="bg-red-500 text-white p-2 text-center rounded-md mb-4">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              required
            />
          </div>

          <p className="text-right">
            <Link href="/verify" className="text-indigo-500">Forgot password?</Link>
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
          <Link href="/signup" className="text-primary font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
