"use client";
import { FC, useEffect, useRef, useState } from "react";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext"; // Adjust path as needed
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
}

interface Notification {
  _id: string;
  senderId: { name: string };
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  conversationId: string; // Added this property
}

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
    role,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    fetchOrCreateConversation,
  } = useChat();

  const { loading } = useAuth();
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch selected user's information when conversation changes
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    const fetchSelectedUserInfo = async () => {
      const otherParticipant = selectedConversation.participants.find((p) => p._id !== userId);
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
          const data: UserInfo = await response.json();
          setSelectedUserInfo(data);
        } else {
          toast.error("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Network error occurred");
      }
    };

    fetchSelectedUserInfo();
  }, [selectedConversation, userId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pusher Setup for real-time features
  useEffect(() => {
    if (!userId) return;

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
      conversationChannel.bind(
        "typing-indicator",
        (data: { senderId: string; isTyping: boolean }) => {
          if (data.senderId !== userId && data.isTyping) {
            toast(`${selectedUserInfo?.name || "User"} is typing...`, {
              id: "typing-toast",
              duration: 3000,
              position: "bottom-right",
            });
          }
        }
      );
    }

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      conversationChannel?.unbind_all();
      conversationChannel?.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, selectedConversation, selectedUserInfo]);

  // Handle typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTyping = () => {
    if (!selectedConversation || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/typing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        conversationId: selectedConversation._id,
        senderId: userId,
        isTyping: true,
      }),
    }).catch((err) => console.error("Typing event failed:", err));

    typingTimeoutRef.current = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
      hour12: true,
    });
  };

  // Handle clicking a notification
  const handleNotificationClick = async (notification: Notification) => {
    const conversation = conversations.find((conv) => conv._id === notification.conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      if (!notification.isRead) {
        await markNotificationsAsRead([notification._id]);
      }
      router.push(`/guides/dashboard/message/${notification.conversationId}`);
    }
    setShowNotifications(false);
  };

  // Sync selected conversation with URL
  useEffect(() => {
    if (!pathname || !userId || loading) return;

    if (pathname.startsWith("/guides/dashboard/message/")) {
      const conversationId = pathname.split("/").pop();
      if (conversationId && conversationId !== selectedConversation?._id) {
        const existingConversation = conversations.find((conv) => conv._id === conversationId);
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else {
          fetchOrCreateConversation(conversationId).then((conv) => {
            if (conv) setSelectedConversation(conv);
          });
        }
      }
    }
  }, [pathname, conversations, selectedConversation, fetchOrCreateConversation, setSelectedConversation, userId, loading]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/3 bg-gray-800 h-screen p-4 overflow-y-auto border-r border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Chats</h2>
          <div className="relative" ref={notificationDropdownRef}>
            <button
              className="relative text-gray-400 hover:text-white"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-400">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-700 ${
                        notification.isRead ? "bg-gray-800" : "bg-gray-700"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="text-sm font-semibold">{notification.senderId.name}</p>
                      <p className="text-sm">
                        {notification.type === "budget_message"
                          ? role === "guide"
                            ? `Budget proposal: ${notification.message}`
                            : "New budget proposal received"
                          : notification.message}
                      </p>
                      <p className="text-xs text-gray-400">{formatExactTime(notification.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {users.map((user) => {
            const existingConv = conversations.find((conv) =>
              conv.participants.some((p) => p._id === user._id)
            );
            const convNotifications = notifications.filter(
              (n) => n.conversationId === existingConv?._id && !n.isRead
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
                <div className="flex items-center">
                  <p className="font-semibold">{user.name}</p>
                  {convNotifications.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {convNotifications.length}
                    </span>
                  )}
                </div>
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
                  {selectedConversation.participants.find((p) => p._id !== userId)?.name ||
                    "Unknown User"}
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
                const budgetAmount = isBudgetMessage
                  ? parseInt(msg.message.replace("@budget ", ""), 10)
                  : null;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col max-w-xs">
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
                placeholder={role === "guide" ? "Type a message or @budget <amount>" : "Type a message..."}
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