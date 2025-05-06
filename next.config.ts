import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: process.env.NODE_ENV !== "development",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
        // For Unsplash API images
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
        // For Unsplash images
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
        // For Pexels images
      },
      {
        protocol: "https",
        hostname: "*.org",
        pathname: "/**",
        // For various tourism sites (e.g., official tourism boards)
      },
      {
        protocol: "https",
        hostname: "*.gov",
        pathname: "/**",
        // For government tourism sites
      },
      

    ],

  },
};

export default nextConfig;