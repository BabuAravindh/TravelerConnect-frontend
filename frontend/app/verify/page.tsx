'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '']);
  const router = useRouter();

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleRedirect = (e) => {
    e.preventDefault();
    router.push('/verify/verify_mail/confirm_password');
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredCode = code.join('');
    console.log('Entered Code:', enteredCode);
    router.push('/dashboard'); // Redirect to dashboard after verification
  };

  return (
    <div classNameName="relative flex min-h-screen flex-col justify-center overflow-hidden bg-primary  py-12">
      <div classNameName="relative mx-auto w-full max-w-lg rounded-2xl bg-white px-6 pt-10 pb-9 shadow-xl">
        <div classNameName="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div classNameName="flex flex-col items-center justify-center space-y-2 text-center">
            <h1 classNameName="text-3xl font-semibold">Email Verification</h1>
            <p classNameName="text-sm font-medium text-gray-400">We have sent a code to your email hi@tekkubit.com</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div classNameName="flex flex-col space-y-16">
              <div classNameName="mx-auto flex w-full max-w-xs flex-row items-center justify-between">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    classNameName="h-16 w-16 flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-center text-lg outline-none ring-primary focus:bg-gray-50 focus:ring-1"
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                ))}
              </div>
              <div classNameName="flex flex-col space-y-5">
              <button
      type="submit"
      onClick={handleRedirect}
      classNameName="w-full rounded-xl bg-button py-5 text-sm text-white shadow-sm outline-none"
    >
      Verify Account
    </button>
                <div classNameName="flex flex-row items-center justify-center space-x-1 text-sm font-medium text-gray-500">
                  <p>Didn't receive code?</p>
                  <button classNameName="text-button">Resend</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
