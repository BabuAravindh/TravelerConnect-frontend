import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: process.env.NODE_ENV !== "development", // Enable in production, disable in development
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*", // Allow all HTTPS hosts
      },
    ],
  },
};

export default nextConfig;