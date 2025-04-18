"use client";

import { FC, useEffect, useRef, useState } from "react";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const [selectedUserInfo, setSelectedUserInfo] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch selected user's information when conversation changes
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    const fetchSelectedUserInfo = async () => {
      const otherParticipant = selectedConversation.participants.find(
        (p) => p._id !== userId
      );
      
      if (!otherParticipant) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chats/profile/${otherParticipant._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSelectedUserInfo(data);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchSelectedUserInfo();
  }, [selectedConversation, userId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pusher Setup for real-time features
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  
    const channel = pusher.subscribe("chat-app");
    const conversationChannel = selectedConversation
      ? pusher.subscribe(`chat-${selectedConversation._id}`)
      : null;

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

    if (conversationChannel) {
      conversationChannel.bind("new-message", (data: any) => {
        // Assuming useChat updates messages automatically via handleSendMessage or similar
        // No additional action needed here since messages update will trigger re-render
        console.log("New message received:", data);
      });

      conversationChannel.bind("typing-indicator", (data: { senderId: string; isTyping: boolean }) => {
        if (data.senderId !== userId && data.isTyping) {
          toast(`${selectedUserInfo?.name || "User"} is typing...`, {
            id: "typing-toast",
            duration: 3000,
            position: "bottom-right",
          });
        }
      });
    }

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      conversationChannel?.unbind_all();
      conversationChannel?.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, selectedConversation]);

  // Handle typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTyping = () => {
    if (!selectedConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConversation._id,
        senderId: userId,
        isTyping: true,
      }),
    }).catch((err) => console.error("Typing event failed:", err));
  
    typingTimeoutRef.current = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          senderId: userId,
          isTyping: false,
        }),
      }).catch((err) => console.error("Typing event failed:", err));
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // Helper function to format timestamp to exact time
  const formatExactTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid time";
    return date.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    });
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
            {/* Chat Header with Dropdown */}
            <header className="p-4 bg-gray-900 font-semibold border-b border-gray-700 flex justify-between items-center relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
                ref={dropdownRef}
              >
                <p className="mr-2">
                  {selectedConversation.participants.find((p) => p._id !== userId)?.name || "Unknown User"}
                </p>
                <svg
                  className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* User Profile Dropdown */}
              {showDropdown && selectedUserInfo && (
                <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedUserInfo.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedUserInfo.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{selectedUserInfo.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="break-all">{selectedUserInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Bio</p>
                      <p>{selectedUserInfo.bio || "No bio available"}</p>
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Messages Area */}
            <main className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg, index) => {
                const isSender =
                  msg.senderId === userId ||
                  (typeof msg.senderId === "object" && msg.senderId._id === userId);

                const isBudgetMessage = msg.messageType === "budget";
                const budgetAmount = isBudgetMessage ? parseInt(msg.message.replace("@budget ", ""), 10) : null;

                return (
                  <div key={msg._id || index} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
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
                          </div>
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isSender ? "text-right" : "text-left"}`}>
                        {formatExactTime(msg.timestamp)}
                      </p>
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
                className="flex-1 p-2 bg-gray-900 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="ml-2 bg-primary px-4 py-2 rounded-lg text-white disabled:opacity-50"
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