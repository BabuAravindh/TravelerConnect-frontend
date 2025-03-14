"use client";

import { useState, useEffect } from "react";
import DesktopChat from "@/components/DesktopChat";
import MobileChat from "@/components/MobileChat";


const ChatContainer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex">   
      <div className="flex-1 h-screen">{isMobile ? <MobileChat /> : <DesktopChat />}</div>
    </div>
  );
};

export default ChatContainer;
