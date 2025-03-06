"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import UserSidebar from "./UserSidebar";

// Define TypeScript interfaces
interface User {
  username: string;
  img: string;
}

interface ChatMessage {
  sender: string;
  message: string;
}

const MobileChat: React.FC = () => {
  const [loggedIn] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const currentUser: User = {
    username: "John Doe",
    img: "/avatar.jpg",
  };

  const users: User[] = [
    { username: "Jane Doe", img: "/avatar.jpg" },
    { username: "Alice", img: "/avatar.jpg" },
    { username: "Bob", img: "/avatar.jpg" },
  ];

  const chats: ChatMessage[] = useMemo(
    () => [
      { sender: "Jane Doe", message: "Hey! How are you?" },
      { sender: "John Doe", message: "I'm good! How about you?" },
      { sender: "Jane Doe", message: "I'm doing great!" },
    ],
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, text]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <UserSidebar />

      {/* Chat Section */}
      <div className="flex flex-col flex-1 bg-primary text-white h-full">
        {loggedIn ? (
          <>
            {!selectedUser ? (
              <div className="flex items-center justify-center w-full h-full p-4">
                <div className="w-full max-w-md">
                  <h2 className="text-center text-lg font-semibold mb-4">Chats</h2>
                  <div className="flex flex-col space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center gap-4 p-4 rounded-lg cursor-pointer bg-button hover:bg-opacity-90 transition-all"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Image
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                          src={user.img}
                          alt="avatar"
                        />
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                      src={selectedUser.img}
                      alt=""
                    />
                    <span className="font-semibold text-md">{selectedUser.username}</span>
                  </div>
                  <button
                    className="text-sm text-gray-400 hover:text-gray-200 transition-all"
                    onClick={() => setSelectedUser(null)}
                  >
                    Back
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chats.map((chat, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        chat.sender === currentUser.username ? "justify-end" : "justify-start"
                      } mb-2`}
                    >
                      {chat.sender !== currentUser.username && (
                        <Image
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full mr-2"
                          src="/avatar.jpg"
                          alt=""
                        />
                      )}
                      <div
                        className={`p-3 rounded-lg max-w-xs ${
                          chat.sender === currentUser.username ? "bg-blue-500" : "bg-gray-700"
                        }`}
                      >
                        <p>{chat.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef}></div>
                </div>

                {/* Chat Input */}
                <div className="flex items-center border-t border-gray-700 p-4 gap-4 bg-gray-800">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-gray-700 rounded-lg p-3 outline-none text-white"
                  />
                  <button className="bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600 transition-all">
                    Send
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-lg">Please log in to continue</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileChat;
