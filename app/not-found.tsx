"use client";

import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-7xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-600 mt-4">Oops! The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
