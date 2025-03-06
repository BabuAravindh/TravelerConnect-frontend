"use client"
import ChatUI from '@/components/DesktopChat'
import ChatApp from '@/components/MobileChat'
import UserSidebar from '@/components/UserSidebar'
import React from 'react'
import { useEffect, useState } from 'react'

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='flex flex-row h-screen '>
      <div className='w-1/40 h-full'>
        <UserSidebar/>
      </div>
      <div className='flex-1 h-full'>
        {isMobile ? <ChatApp /> : <ChatUI />}   
      </div>
    </div>
  );
}

export default Page;
