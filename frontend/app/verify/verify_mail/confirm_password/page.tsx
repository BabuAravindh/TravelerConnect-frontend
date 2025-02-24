"use client";
import { useState } from 'react';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      console.log('Password successfully reset');
      // Proceed with password reset logic
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-primary  ">
      <div className="w-full max-w-md bg-white  rounded-xl shadow-lg  border-2 border-indigo-300 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black ">Set New Password</h1>
          <p className="mt-2 text-sm text-black ">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="grid gap-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-bold ml-1 mb-2 text-black">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm  shadow-sm"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold ml-1 mb-2 text-black">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm  shadow-sm"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md border border-transparent font-semibold bg-button text-white hover:bg-opy-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default NewPassword;
