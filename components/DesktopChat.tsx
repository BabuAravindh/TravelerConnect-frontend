"use client";

import { FC, useEffect, useRef, useState } from "react";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import Pusher from "pusher-js";
import toast from "react-hot-toast";

const DesktopChat: FC = () => {
  const {
    users,
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleSelectUser,
    userId,
  } = useChat();

  const { user, hasRole, loading } = useAuth();
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pusher Setup
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "ap2",
    });
  
    const channel = pusher.subscribe("chat-app");
  
    channel.bind("user-active", (data: { userId: string }) => {
      setActiveUsers((prev) => [...new Set([...prev, data.userId])]);
    });
    
  
    channel.bind("user-inactive", (data: { userId: string }) => {
      setActiveUsers((prev) => prev.filter((id) => id !== data.userId));
    });
  
    channel.bind("typing", (data: { senderId: string; senderName: string }) => {
      if (data.senderId !== userId) {
        toast(`${data.senderName} is typing...`, {
          id: "typing-toast",
          duration: 3000,
          position: "bottom-right",
        });
      }
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId]); // Make sure dependency is correctly set
  
  // Handle Typing Event
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    // Emit typing event immediately
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: userId, senderName: user?.name }),
    }).catch((err) => console.error("Typing event failed:", err));
  
    // Reset timeout to avoid spamming the server
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000); // 3-second delay before allowing another typing event
  };
  


  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/3 bg-gray-800 h-screen p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        <div className="space-y-3">
          {users.map((user) => {
              const existingConv = conversations.find((conv) =>
                conv.participants.some((p) => p._id === user._id)
              );

              return (
                <div
                  key={user._id}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer rounded-lg flex items-center justify-between ${
                    selectedConversation?._id === existingConv?._id ? "bg-gray-700" : ""
                  }`}
                  onClick={() =>
                    existingConv ? setSelectedConversation(existingConv) : handleSelectUser(user)
                  }
                >
                  <p className="font-semibold">{user.name}</p>
                  {activeUsers.includes(user._id) && (
                    <span className="text-green-400 text-sm">● Online</span>
                  )}
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
            <header className="p-4 bg-gray-900 font-semibold border-b border-gray-700 flex justify-between items-center">
              <p>
                {selectedConversation.participants.find((p) => p._id !== userId)?.name || "Unknown User"}
              </p>
            </header>

            {/* Messages */}
            <main className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg, index) => {
                const isSender =
                  msg.senderId === userId ||
                  (typeof msg.senderId === "object" && msg.senderId._id === userId);

                const isBudgetMessage = msg.messageType === "budget";
                const budgetAmount = isBudgetMessage ? parseInt(msg.message.replace("@budget ", ""), 10) : null;

                return (
                  <div key={msg.senderId.toString() + index} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col max-w-xs">
                      {!isSender && <p className="text-sm text-gray-400">{msg?.senderName}</p>}
                      <div
                        className={`p-3 rounded-lg ${
                          isSender
                            ? "bg-primary text-white self-end"
                            : isBudgetMessage
                            ? "bg-green-200 text-black"
                            : "bg-gray-700 text-white self-start"
                        }`}
                      >
                        {isBudgetMessage ? (
                          <div>
                            <p className="font-semibold">Budget Proposal: ₹{budgetAmount}</p>
                            {!isSender && (
                              <button
                                onClick={() => budgetAmount && console.log("Proceeding to payment for:", budgetAmount)}
                                className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                              >
                                Proceed to Payment
                              </button>
                            )}
                          </div>
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </main>

            {/* Message Input */}
            <footer className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                className="flex-1 p-2 bg-gray-900 text-white border border-gray-600 rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
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
            Select a conversation to start chatting
          </div>
        )}
      </section>
    </div>
  );
};

export default DesktopChat;
