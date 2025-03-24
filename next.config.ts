import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
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