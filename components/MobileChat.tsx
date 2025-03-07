"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getUserConversations, getMessages, sendMessage } from "../services/chatService";

interface ChatMessage {
  sender: string;
  message: string;
}

interface Conversation {
  _id: string;
  participants: { username: string; img: string }[];
}

const MobileChat: React.FC<{ userId: string }> = ({ userId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getUserConversations(userId).then(setConversations);
  }, [userId]);

  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation._id).then(setMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    await sendMessage(selectedConversation!._id, userId, text);
    setMessages((prev) => [...prev, { sender: userId, message: text }]);
    setText("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-800 p-4">
        <h2 className="text-white text-lg font-semibold mb-4">Chats</h2>
        {conversations.map((conv) => {
          const otherUser = conv.participants.find((p) => p.username !== userId);
          return (
            <div
              key={conv._id}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-700 cursor-pointer hover:bg-gray-600"
              onClick={() => setSelectedConversation(conv)}
            >
              <Image width={48} height={48} className="rounded-full" src={otherUser?.img || "/default-avatar.jpg"} alt="avatar" />
              <span className="text-white">{otherUser?.username}</span>
            </div>
          );
        })}
      </div>

      {/* Chat Section */}
      <div className="flex-1 bg-gray-900 text-white flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-800 flex items-center justify-between">
              <span className="font-semibold">{selectedConversation.participants.find((p) => p.username !== userId)?.username}</span>
              <button className="text-gray-400" onClick={() => setSelectedConversation(null)}>Back</button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === userId ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-lg max-w-xs ${msg.sender === userId ? "bg-blue-500" : "bg-gray-700"}`}>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef}></div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 flex gap-4">
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-gray-700 p-3 rounded-lg text-white"
              />
              <button onClick={handleSendMessage} className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">Send</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <h2>Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileChat;
