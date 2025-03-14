"use client";

import { FC } from "react";
import useChat from "@/hooks/useChat";

const ChatApp: FC = () => {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    userId,
  } = useChat();

  return (
    <div className="flex h-screen">
      {/* Sidebar for Conversations */}
      <aside className="w-1/3 bg-gray-900 h-screen p-4">
        <h2 className="text-lg font-bold text-white mb-4">Chats</h2>
        <div className="space-y-3">
          {conversations.map((conv) => {
            const otherParticipant = conv.participants.find((p) => p._id !== userId);
            return (
              <div
                key={conv._id}
                className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                  selectedConversation?._id === conv._id ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <p className="font-semibold text-white">{otherParticipant?.name || "Unknown User"}</p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat Window */}
      <section className="w-2/3 bg-gray-800 h-screen flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="p-4 bg-gray-900 text-white font-semibold border-b border-gray-700">
              {selectedConversation.participants.find((p) => p._id !== userId)?.name || "Unknown User"}
            </header>

            {/* Messages List */}
            <main className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={msg.senderId.toString() + index}
                  className={`flex ${
                    msg.senderId === userId ||
                    (typeof msg.senderId === "object" && msg.senderId._id === userId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      msg.senderId === userId ||
                      (typeof msg.senderId === "object" && msg.senderId._id === userId)
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </main>

            {/* Message Input */}
            <footer className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                className="flex-1 p-2 bg-gray-900 text-white border border-gray-600 rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 bg-button px-4 py-2 rounded-lg text-white"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </footer>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatApp;
