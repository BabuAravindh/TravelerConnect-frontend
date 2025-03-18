"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

const SOCKET_SERVER_URL = "http://localhost:5000"; // Backend WebSocket server URL

const ChatMessageArea = ({ guideId }: { guideId: string }) => {
  const { userId } = useAuth();
  const { fetchOrCreateConversation } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // ✅ Fetch or create conversation on mount
  useEffect(() => {
    const getConversation = async () => {
      if (!userId || !guideId) return;
      const conversation = await fetchOrCreateConversation(guideId);
      if (conversation) {
        console.log("✅ Conversation ID:", conversation._id);
        setConversationId(conversation._id);
      }
    };
    getConversation();
  }, [userId, guideId]);

  // ✅ Initialize socket connection after conversationId is set
  useEffect(() => {
    if (!userId || !guideId || !conversationId) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId, guideId, conversationId },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.io server");
    });

    newSocket.on("new-message", (message: Message) => {
      console.log("📩 New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, guideId, conversationId]);

  // ✅ Fetch messages after getting conversationId
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/chats/${conversationId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();
        console.log("📜 Fetched messages:", data);
        setMessages(data);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // ✅ Send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !conversationId) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found.");
      return;
    }
  
    console.log("⚠️ Sending message with conversation ID:", conversationId);
  
    try {
      const res = await fetch(`http://localhost:5000/api/chats/send/${conversationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: userId,
          message: newMessage,
        }),
      });
  
      const response = await res.json();
  
      if (!res.ok) {
        console.error("❌ Message sending failed:", response);
        return;
      }
  
      console.log("✅ Message sent:", response);
  
      // Optimistically update UI
      const newMsg: Message = {
        _id: response.messageId,
        senderId: userId,
        receiverId: guideId,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
  
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
  
      // Emit the message via WebSocket
      if (socket) {
        console.log("📡 Emitting message via WebSocket:", newMsg);
        socket.emit("send-message", newMsg);
      } else {
        console.error("❌ Socket is not connected.");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div className="bg-[#6999aa] shadow-lg rounded-lg p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Chat</h2>
      <div className="h-60 overflow-y-auto border border-[#1b374c] p-2 rounded-lg bg-white mb-2">
        {messages.length ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 my-1 rounded-lg w-96 ${
                msg.senderId === userId
                  ? "bg-primary text-white ml-auto"
                  : "bg-gray-200 text-black mr-auto"
              }`}
            >
              {msg.message}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
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
