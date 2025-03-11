"use client";
import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page: React.FC = () => {
  return (
    <ProtectedRoute allowGuest>
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <div className="flex flex-row gap-4 p-4 flex-grow">
        {/* Guide Listing (Center) */}
        <div className="flex-1 flex justify-center items-center">
          <GuideListing />
        </div>
      </div>

      <Footer />
    </div>
    </ProtectedRoute>
  );
};

export default Page;
