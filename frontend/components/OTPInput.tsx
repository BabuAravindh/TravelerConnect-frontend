"use client";

import React from "react";

interface OTPInputProps {
  code: string[];
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  handleChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ code, inputRefs, handleChange, handleKeyDown }) => {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-row items-center justify-between">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current![index] = el)}
          className="h-16 w-16 flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-center text-lg outline-none ring-primary focus:bg-gray-50 focus:ring-1"
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
};

export default OTPInput;
