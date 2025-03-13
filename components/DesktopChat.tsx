"use client";
import { useEffect } from "react";
import useChat from "@/hooks/useChat";
import UserSidebar from "@/components/UserSidebar";

const ChatApp: React.FC = () => {
  const {
    users,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    handleSelectUser,
    setMessages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    userId,
  } = useChat();

  // Fetch messages when a conversation is selected
 
  return (
    <div className="flex h-screen">
      {/* Sidebar for User List */}
      <div className="w-1/3 bg-gray-900 h-screen p-4">
        <h2 className="text-lg font-bold text-white mb-4">Chats</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                selectedConversation?.participants.some((p) => p._id === user._id) ? "bg-gray-700" : ""
              }`}
              onClick={() => handleSelectUser(user)}
              
            >
              <p className="font-semibold text-white">{user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 bg-gray-800 h-screen flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-900 text-white font-semibold border-b border-gray-700">
              {selectedConversation.participants.find((p) => p._id !== userId)?.name || "Unknown User"}
            </div>

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div
                  className={`flex ${
                    msg.senderId === userId || (typeof msg.senderId === "object" && msg.senderId._id === userId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                  key={msg._id || msg.timestamp}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      msg.senderId === userId || (typeof msg.senderId === "object" && msg.senderId._id === userId)
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                className="flex-1 p-2 bg-gray-900 text-white border border-gray-600 rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 bg-button px-4 py-2 rounded-lg text-white"
                onClick={() => newMessage.trim() && handleSendMessage()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
