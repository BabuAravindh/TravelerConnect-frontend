'use client';

import { useState } from 'react';
import GuideDashboard from '../page';
import ChatList from '@/components/ChatList';
import Chat from '@/components/Chat';

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <GuideDashboard>
      <div className="flex flex-col md:flex-row gap-4 min-h-screen md:h-[600px] p-4">
        {/* Chat List - Hidden on mobile when a user is selected */}
        <div className={`w-full md:w-1/3 rounded-xl shadow-md overflow-hidden transition-all duration-300 ${selectedUser ? 'hidden md:block' : ''}`}>
          <ChatList onSelectUser={setSelectedUser} />
        </div>

        {/* Chat View - Hidden on mobile unless a user is selected */}
        <div className={`w-full md:w-2/3 bg-white p-4 rounded-xl shadow-md flex flex-col overflow-hidden transition-all duration-300 ${!selectedUser ? 'hidden md:flex' : ''}`}>
          {selectedUser ? (
            <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : (
            <p className="text-center text-gray-500">Select a conversation</p>
          )}
        </div>
      </div>
    </GuideDashboard>
  );
};

export default MessagesPage;
