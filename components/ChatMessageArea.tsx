"use client";

import { useState, useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import Pusher from "pusher-js";
import fetchWithAuth from "@/utils/fetchWithAuth";

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
  };
  receiverId: {
    _id: string;
    name: string;
  };
  message: string;
  timestamp: string;
}


const API_BASE_URL = "http://localhost:5000"; // Backend URL

const ChatMessageArea = ({ guideId }: { guideId: string }) => {
  const { userId } = useAuth();
  const { fetchOrCreateConversation } = useChat();
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
        console.log("messages:",data)
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
      if (!res.ok) {
        console.error("❌ Message sending failed:", response);
        return;
      }
  
      setMessages((prev) => [...prev, response.message]);
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };
  
  

  return (
    <div className="bg-[#6999aa] shadow-lg rounded-lg p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Chat</h2>
      <div className="h-60 overflow-y-auto border border-[#1b374c] p-2 rounded-lg bg-white mb-2 flex flex-col gap-1">
  {messages.length ? (
    messages.map((message, index) => (
      <div
  key={message._id || index}
  className={`p-2 my-1 rounded-lg max-w-[75%] ${
    (typeof message.senderId === "object"
      ? message.senderId?._id?.toString()
      : message.senderId?.toString()) === userId?.toString()
      ? "bg-primary text-white self-end ml-auto text-right"
      : "bg-gray-200 text-black self-start mr-auto text-left"
  }`}
>
  {message.message}
</div>

    

    ))
  ) : (
    <p className="text-gray-500 text-center w-full">No messages yet</p>
  )}
</div>



      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border border-[#1b374c] rounded-lg"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-[#1b374c] text-white px-4 py-2 rounded-lg"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatMessageArea;
