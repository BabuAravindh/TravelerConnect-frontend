"use client"; // Ensure this runs on the client only
import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import useChat from "@/hooks/useChat";

const MobileChat = () => {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    userId,
  } = useChat(); // Removed 'users' since it's unused

  const [isClient, setIsClient] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true); // Ensure hydration runs only on client
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isClient) return null; // Prevent mismatch between server & client


  if (!selectedConversation) {
    return (
      <div className="h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="p-4 bg-gray-800 text-lg font-semibold">Chats</div>

        {/* Chat List */}
        <div className="p-4 space-y-4">
          {conversations.map((conv) => {
            const otherUser = conv.participants.find((p) => p._id !== userId);
            return (
              <div
                key={conv._id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-700 cursor-pointer hover:bg-gray-600"
                onClick={() => setSelectedConversation(conv)}
              >
             
                <div>
                  <span className="font-semibold">{otherUser?.name}</span>
                  <p className="text-sm text-gray-300">Last message...</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // **Chat Screen**
  const otherUser = selectedConversation.participants.find((p) => p._id !== userId);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 bg-gray-800 text-white">
        <button onClick={() => setSelectedConversation(null)}>
          <ArrowLeft size={24} />
        </button>
        
        <span className="font-semibold">{otherUser?.name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => ( // Removed 'index' as it's unused
          <div 
            className={`flex ${msg.senderId === userId || (typeof msg.senderId === "object" && msg.senderId._id === userId) ? "justify-end" : "justify-start"}`} 
            key={msg._id || msg.timestamp}
          >
            <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === userId || (typeof msg.senderId === "object" && msg.senderId._id === userId) ? "bg-primary text-white" : "bg-gray-700 text-white"}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      {/* Message Input */}
      <div className="p-3 bg-gray-800 flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-700 p-3 rounded-full text-white outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="bg-button p-3 rounded-full text-white hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MobileChat;
