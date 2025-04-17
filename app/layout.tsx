"use client";

import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      
      <body>
        
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>{children}</AuthProvider> {/* ✅ Wraps entire app */}
      </body>
    </html>
  );
}
