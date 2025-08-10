"use client";

import { useState, useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import Pusher from "pusher-js";
import fetchWithAuth from "@/utils/fetchWithAuth";

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
  } | string;
  receiverId: {
    _id: string;
    name: string;
  };
  message: string;
  timestamp: string;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Backend URL

const ChatMessageArea = ({ guideId }: { guideId: string }) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  // ✅ Fetch or create conversation
  const getConversation = useCallback(async () => {
    if (!userId || !guideId) return;

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/chats/conversation/${userId}/${guideId}`
      );
      const data = await res.json();

      if (data.success && data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("❌ Error fetching conversation:", error);
    }
  }, [userId, guideId]);

  useEffect(() => {
    getConversation();
  }, [getConversation]);

  // ✅ Fetch messages when conversationId is available
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/chats/${conversationId}`);
        const data = await res.json();
        ("messages:",data)
        setMessages(data);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);
  useEffect(() => {
    if (!userId) {
      let storedGuestId = localStorage.getItem("guestId");
      if (!storedGuestId) {
        storedGuestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("guestId", storedGuestId);
      }
      setGuestId(storedGuestId);
    }
  }, [userId]);
  
  const senderId = userId || guestId;

  // ✅ Setup Pusher for real-time updates
  useEffect(() => {
    if (!conversationId) return;
  
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  
    const channel = pusher.subscribe(`chat-${conversationId}`);
    
    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        // ✅ Check if message already exists before adding
        if (!prev.some((msg) => msg._id === newMessage._id)) {
          return [...prev, newMessage];
        }
        return prev;
      });
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [conversationId]);
  

  // ✅ Send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !senderId || !guideId) return;
  
    try {
      const sendMessageAPI = `${API_BASE_URL}/api/chats/send/${guideId}`;
      const res = await fetchWithAuth(sendMessageAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          message: newMessage,
          isGuest: !userId, // Mark as guest if not logged in
        }),
      });
  
      const response = await res.json();
      (response)
      if (!res.ok) {
        console.error("❌ Message sending failed:", response);
        return;
      }
  
     
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };
  
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat</h2>
      <div className="h-60 overflow-y-auto border border-gray-300 p-4 rounded-lg bg-gray-50 mb-4 flex flex-col gap-3">
        {messages.length ? (
          messages.map((message, index) => {
            const isCurrentUser = 
              (typeof message.senderId === 'object' 
                ? message.senderId?._id?.toString() 
                : message.senderId?.toString()) === userId?.toString();
            
            return (
              <div
                key={message._id || index}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs md:max-w-md ${
                    isCurrentUser
                      ? 'bg-[#1b374c] text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.message}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}
      </div>
  
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b374c]"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-[#1b374c] hover:bg-[#2a4d6a] text-white px-4 py-2 rounded-lg transition-colors"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatMessageArea;
