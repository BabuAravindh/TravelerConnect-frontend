"use client";

import { useState } from "react";
import useSignup from "@/hooks/useSignup";

const SignupPage = () => {
  const { serverMessage, handleSignup } = useSignup();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      name: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    handleSignup(data);
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center items-center">
      <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex w-full overflow-hidden">
        {/* Left Section - Sign Up Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
            <p className="text-gray-600 mt-2">Create your TravelerConnect account</p>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <button
              type="submit"
              className="w-full py-3 bg-button text-white font-semibold rounded-lg hover:bg-opacity-80 transition"
            >
              Create Account
            </button>
          </form>

          {serverMessage && <p className="mt-4 text-center text-red-500">{serverMessage}</p>}

          <p className="mt-4 text-sm text-center text-gray-600">
            By signing up, you agree to our{" "}
            <a href="#" className="text-indigo-500">Terms & Privacy Policy</a>.
          </p>

          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-500 font-medium">Log in</a>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden lg:flex items-center justify-center w-1/2 bg-indigo-100">
          <img
            src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg"
            alt="Traveler Illustration"
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
