import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="px-4 pt-16  sm:max-w-xl md:max-w-full lg:max-w-screen-7xl md:px-24 lg:px-8 border-t-2 bg-gray-50">
      <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Logo and Description */}
        <div className="sm:col-span-2">
          <Link href="/" aria-label="Go home" title="TravelerConnect" className="inline-flex items-center">
            <span className="ml-2 text-xl font-bold tracking-wide text-gray-800">TravelerConnect</span>
          </Link>
          <div className="mt-6 lg:max-w-xl">
            <p className="text-sm text-gray-800">
              Discover, connect, and explore with TravelerConnect! We help travelers find experienced guides, plan trips, 
              and create unforgettable experiences with seamless booking and communication.
            </p>
          </div>
        </div>

        {/* Explore and Popular Destinations */}
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-base font-bold tracking-wide text-gray-900">Explore</p>
          <Link href="#">Find a Guide</Link>
          <Link href="#">Plan a Trip</Link>
          <Link href="#">Book Experiences</Link>
          <p className="text-base font-bold tracking-wide text-gray-900">Popular Destinations</p>
          <Link href="#">Bali, Indonesia</Link>
          <Link href="#">Paris, France</Link>
          <Link href="#">Santorini, Greece</Link>
        </div>

        {/* Connect With Us and Support */}
        <div>
          <p className="text-base font-bold tracking-wide text-gray-900">Connect With Us</p>
          <div className="flex flex-col gap-2">
            <Link href="#">Facebook</Link>
            <Link href="#">Instagram</Link>
            <Link href="#">Twitter</Link>
          </div>
          <p className="text-base font-bold tracking-wide text-gray-900 mt-4">Support</p>
          <div className="flex">
            <p className="mr-1 text-gray-800">Email:</p>
            <Link href="mailto:support@travelerconnect.com" title="send email" className="text-gray-800 hover:text-blue-500">
              support@travelerconnect.com
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright and Links */}
      <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} TravelerConnect. All rights reserved.</p>
        <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
          <li>
            <Link href="/privacyandpolicy" className="text-sm text-gray-600 transition-colors duration-300 hover:text-blue-500">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="#" className="text-sm text-gray-600 transition-colors duration-300 hover:text-blue-500">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="#" className="text-sm text-gray-600 transition-colors duration-300 hover:text-blue-500">
              Help Center
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};
