'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
    } else {
      setError('');
      console.log('Reset password email sent to:', email);
      router.push('/verify');
    }
  };

  return (
    <main classNameName="flex items-center justify-center min-h-screen  bg-primary">
      <div classNameName="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl">
        <div classNameName="text-center">
          <h1 classNameName="text-3xl font-extrabold text-gray-900">Forgot Password?</h1>
          <p classNameName="mt-2 text-sm text-gray-600">
            Remember your password?{' '}
            <a classNameName="text-white hover:underline" href="/login">
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
              classNameName="w-full py-3 px-6 text-white bg-button hover:bg-opacity-90 text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}