import Link from "next/link";

export const Footer = () => {
  return (
    <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" aria-label="Go home" title="Company" className="inline-flex items-center">
            <svg
              className="w-8 text-deep-purple-accent-400"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeWidth="2"
              strokeLinecap="round"
              strokeMiterlimit="10"
              stroke="currentColor"
              fill="none"
            >
              <rect x="3" y="1" width="7" height="12"></rect>
              <rect x="3" y="17" width="7" height="6"></rect>
              <rect x="14" y="1" width="7" height="6"></rect>
              <rect x="14" y="11" width="7" height="12"></rect>
            </svg>
            <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">Company</span>
          </Link>
        </div>
        
        {/* Other sections remain unchanged */}

        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
          <p className="text-sm text-gray-600">© Copyright 2020 Lorem Inc. All rights reserved.</p>
          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            <li>
              <Link href="/" className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">
                F.A.Q
              </Link>
            </li>
            <li>
              <Link href="/" className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
