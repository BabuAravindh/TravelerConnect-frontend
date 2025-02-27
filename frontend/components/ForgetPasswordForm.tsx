"use client";

import useForgotPassword from "@/hooks/useForgetPassword";

const ForgotPasswordForm = () => {
  const { email, setEmail, error, loading, sendResetEmail } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendResetEmail();
  };

  return (
    <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Forgot Password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Remember your password?{" "}
          <a className="text-button hover:underline" href="/login">
            Login here
          </a>
        </p>
      </div>

      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-white bg-button hover:bg-opacity-90 text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
