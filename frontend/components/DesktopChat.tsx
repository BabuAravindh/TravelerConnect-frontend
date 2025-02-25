"use client";
import React, { useState, useRef, useEffect } from "react";

const ChatUI = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const endRef = useRef(null);

  const currentUser = { username: "John Doe", avatar: "/avatar.jpg" };
  const users = [
    { username: "Jane Doe", avatar: "/images/men1.jpg" },
    { username: "Alice", avatar: "/images/men2.jpg" },
    { username: "Bob", avatar: "/images/men3.jpg" },
  ];


  const sendMessage = () => {
    if (message.trim()) {
      setChats([...chats, { sender: currentUser.username, message }]);
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-primary p-4 border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Chats</h2>
        {users.map((user) => (
          <div
            key={user.username}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700 border-b border-black"
            onClick={() => setSelectedUser(user)}
          >
            <img className="w-10 h-10 rounded-full" src={user.avatar} alt="avatar" />
            <span>{user.username}</span>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="flex flex-col flex-1">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-primary border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full" src={selectedUser.avatar} alt="" />
                <span className="font-semibold">{selectedUser.username}</span>
              </div>
              <button
                className="text-sm text-gray-400 hover:text-gray-200"
                onClick={() => setSelectedUser(null)}
              >
                Back
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.sender === currentUser.username ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      chat.sender === currentUser.username ? "bg-button" : "bg-gray-700"
                    }`}
                  >
                    <p>{chat.message}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef}></div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-4">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-700 p-3 rounded-lg outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-button px-4 py-2 rounded-lg hover:bg-opacity-90"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-lg">Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUI;
