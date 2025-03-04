"use client";
import { useState, useEffect } from "react";
import DesktopChat from "@/components/DesktopChat";
import MobileChat from "@/components/MobileChat";


const ChatContainer = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Mobile when width < 768px (md breakpoint)
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Listen for window resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
    <div className="h-screen">
      {isMobile ? <MobileChat /> : <DesktopChat />}
    </div>
    </>
  );
};

export default ChatContainer;
