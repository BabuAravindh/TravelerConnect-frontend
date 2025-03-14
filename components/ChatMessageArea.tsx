"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import useAuth from "@/hooks/useAuth";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string; // Fixed field name
  timestamp: string;
}

const API_BASE_URL = "http://localhost:5000/api/chats"; // Adjust as needed
const SOCKET_SERVER_URL = "http://localhost:5000"; // Backend WebSocket server URL

const ChatMessageArea = ({ guideId }: { guideId: string }) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null); // ✅ Fixed TypeScript error

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !guideId) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId, guideId },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    newSocket.on("new-message", (message: Message) => {
      console.log("New message received via Socket.io:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, guideId]);

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !guideId) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/conversation?userId=${userId}&guideId=${guideId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId, guideId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return; // Prevent sending empty messages

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: userId as string,
      receiverId: guideId,
      message: newMessage.trim(), // ✅ Fixed field name
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`${API_BASE_URL}/send/${guideId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ senderId: userId, message: newMessage.trim() }),
      });

      const data = await res.json();

      if (!data?.success) {
        // Remove the temp message on failure
        setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      } else {
        // Update the last message with the actual message data from the backend
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempMessage._id ? data.message : msg))
        );

        // Emit message to socket server
        socket.emit("send-message", data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }

    setNewMessage(""); // Reset input after sending
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
