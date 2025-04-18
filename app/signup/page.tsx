"use client";

import { useState, useCallback, useMemo } from "react";
import useSignup from "@/hooks/useSignup";
import Image from "next/image";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type PasswordStrength = {
  score: number;
  message: string;
  color: string;
};

const SignupPage = () => {
  const { handleSignup, loading, validationErrors, isSubmitted } = useSignup();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) return { score: 0, message: "", color: "" };

    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    score = Object.values(requirements).filter(Boolean).length;

    const messages = [
      "Very weak",
      "Weak",
      "Moderate",
      "Strong",
      "Very strong",
    ];

    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      score,
      message: messages[score],
      color: colors[score],
    };
  }, []);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(formData.password),
    [formData.password, calculatePasswordStrength]
  );

  const validateForm = useCallback(() => {
    let newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else {
      const password = formData.password;
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!strongPasswordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
        isValid = false;
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    return { isValid, errors: newErrors };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { isValid, errors } = validateForm();

    if (!isValid) {
      // Set errors and focus on first error field
      const firstErrorField = Object.entries(errors).find(([_, value]) => value)?.[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.focus();
      }
      return;
    }

    await handleSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-primary flex justify-center items-center p-4">
        <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex flex-col lg:flex-row w-full overflow-hidden">
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="text-gray-600 mt-2">
                Create your TravelerConnect account
              </p>
            </div>

            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.name
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-400"
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || isSubmitted}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X size={14} />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.email
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-400"
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || isSubmitted}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X size={14} />
                    {validationErrors.email}
                    {validationErrors.email.includes("already registered") && (
                      <Link href="/login" className="text-indigo-500 underline ml-1">
                        Login instead
                      </Link>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.password
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-indigo-400"
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading || isSubmitted}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                    disabled={loading || isSubmitted}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                {validationErrors.password ? (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X size={14} />
                    {validationErrors.password}
                  </p>
                ) : (
                  formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-sm ${
                                  i <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="flex items-center gap-1">
                          {formData.password.length >= 8 ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                          At least 8 characters
                        </p>
                        <p className="flex items-center gap-1">
                          {/[A-Z]/.test(formData.password) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                          Uppercase letter
                        </p>
                        <p className="flex items-center gap-1">
                          {/[a-z]/.test(formData.password) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                          Lowercase letter
                        </p>
                        <p className="flex items-center gap-1">
                          {/\d/.test(formData.password) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                          Number
                        </p>
                        <p className="flex items-center gap-1">
                          {/[@$!%*?&]/.test(formData.password) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-500" />
                          )}
                          Special character (@$!%*?&)
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.confirmPassword
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-indigo-400"
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading || isSubmitted}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                    disabled={loading || isSubmitted}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X size={14} />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isSubmitted}
                className={`w-full py-3 bg-button text-white font-semibold rounded-lg transition flex justify-center items-center gap-2 ${
                  loading || isSubmitted
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-opacity-90"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : isSubmitted ? (
                  <>
                    <Check size={18} />
                    Account Created!
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-indigo-500 hover:underline">
                Terms & Privacy Policy
              </Link>
              .
            </p>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-500 font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="w-full lg:w-1/2 bg-transparent flex items-center justify-center p-8">
            <div className="max-w-md">
              <Image
                src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg"
                alt="Traveler Illustration"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Join Our Community
                </h3>
                <p className="mt-2 text-gray-600">
                  Connect with travelers around the world and share your
                  adventures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignupPage;