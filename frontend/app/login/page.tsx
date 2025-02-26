"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      router.push("/");
    }
  }, [router]);

  const getUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    if (storedUsers.length === 0) {
      const defaultUsers = [
        { email: "admin@example.com", password: "adminpass", role: "admin" },
        { email: "user@example.com", password: "userpass", role: "user" },
        { email: "guide@example.com", password: "guidepass", role: "guide" },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return storedUsers;
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("email", user.email);
      localStorage.setItem("userRole", user.role);
      router.push("/");
    } else {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Sign In</h1>

        {error && <p className="bg-red-500 text-white p-2 text-center rounded-md mb-4">{error}</p>}

        <form className="space-y-5" onSubmit={handleLogin}>
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

          <button
            type="submit"
            className="w-full bg-button hover:bg-opacity-80 text-white font-semibold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
