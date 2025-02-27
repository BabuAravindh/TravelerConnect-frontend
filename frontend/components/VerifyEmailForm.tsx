"use client";

import useVerifyEmail from "@/hooks/useVerifyEmail";
import OTPInput from "@/components/OTPInput";

const VerifyEmailForm = () => {
  const email = "hi@tekkubit.com"; // Get from state/context if dynamic
  const {
    code,
    error,
    loading,
    resendDisabled,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
  } = useVerifyEmail(email);

  return (
    <div className="relative mx-auto w-full max-w-lg rounded-2xl bg-white px-6 pt-10 pb-9 shadow-xl">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Email Verification</h1>
          <p className="text-sm font-medium text-gray-400">
            We have sent a code to your email <span className="font-bold">{email}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-8">
            <OTPInput code={code} inputRefs={inputRefs} handleChange={handleChange} handleKeyDown={handleKeyDown} />

            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="flex flex-col space-y-5">
              <button
                type="submit"
                className="w-full rounded-xl bg-button py-5 text-sm text-white shadow-sm outline-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Account"}
              </button>
              <div className="flex flex-row items-center justify-center space-x-1 text-sm font-medium text-gray-500">
                <p>Didn't receive code?</p>
                <button
                  type="button"
                  className="text-button disabled:opacity-50"
                  onClick={handleResend}
                  disabled={resendDisabled}
                >
                  {resendDisabled ? "Wait 30s" : "Resend"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
