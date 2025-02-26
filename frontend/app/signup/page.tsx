"use client";
import { FaGoogle } from "react-icons/fa";

const SignupPage = () => {
 
  

  
  return (
    <div className="min-h-screen bg-primary flex justify-center items-center">
      <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex w-full overflow-hidden">
        {/* Left Section - Sign Up Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
            <p className="text-gray-600 mt-2">Create your TravelerConnect account</p>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 flex flex-col gap-4">
            <a href="http://localhost:5000/auth/google" className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              <FaGoogle className="text-red-500" />
              <span className="ml-3 font-medium">Sign Up with Google</span>
            </a>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center text-gray-500">
            <div className="flex-1 border-t"></div>
            <span className="px-3 text-sm">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <button className="w-full py-3 bg-button text-white font-semibold rounded-lg hover:bg-opacity-80 transition">
              Create Account
            </button>
          </form>

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