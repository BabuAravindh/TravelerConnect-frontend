"use client"
import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import UserSidebar from './UserSidebar';

const ChatApp = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const endRef = useRef(null);

  const currentUser = { username: "John Doe", avatar: "/src/assets/avatar.jpg" };
  const users = [
    { username: "Jane Doe", img: "/src/assets/avatar.jpg" },
    { username: "Alice", img: "/src/assets/avatar.jpg" },
    { username: "Bob", img: "/src/assets/avatar.jpg" }
  ];

  const chats = [
    { sender: "Jane Doe", message: "Hey! How are you?" },
    { sender: "John Doe", message: "I'm good! How about you?" },
    { sender: "Jane Doe", message: "I'm doing great!" }
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleLogout = () => {
    setLoggedIn(false);
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {loggedIn ? (
        <>
          {!selectedUser ? (
            <div className="flex items-center justify-center w-full h-full p-4">

              <div className="w-full max-w-md">
                <h2 className="text-center text-lg font-semibold mb-4">Chats</h2>
                <div className="flex flex-col space-y-3">
                  {users.map(user => (
                    <div 
                      key={user.username} 
                      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700"
                      onClick={() => setSelectedUser(user)}
                    >
                      <img className="w-12 h-12 rounded-full" src={user.img} alt="avatar" />
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
              <UserSidebar/>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex lg:items-center justify-between border-b border-gray-700 p-4 bg-gray-800">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full" src={selectedUser.img} alt="" />
                  <span className="font-semibold text-md">{selectedUser.username}</span>
                </div>
                <button className="text-sm text-gray-400" onClick={() => setSelectedUser(null)}>Back</button>
              </div>
              <div className="flex-1 overflow-y-scroll p-4 space-y-4">
                {chats.map((chat, index) => (
                  <div key={index} className={`flex ${chat.sender === currentUser.username ? 'justify-end' : 'justify-start'}`}>
                    {chat.sender !== currentUser.username && <img className="w-8 h-8 rounded-full mr-2" src="/src/assets/avatar.jpg" alt="" />}
                    <div className={`p-3 rounded-lg max-w-xs ${chat.sender === currentUser.username ? 'bg-blue-500' : 'bg-gray-700'}`}>
                      <p>{chat.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef}></div>
              </div>
              <div className="flex items-center border-t border-gray-700 p-4 gap-4 bg-gray-800">
                <input
                  type='text'
                  placeholder='Type a message...'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-gray-700 rounded-lg p-3 outline-none"
                />
                <div className="relative">
                  <img className="w-6 h-6 cursor-pointer" src="/src/assets/emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
                  {open && <div className="absolute bottom-10 left-0 bg-gray-800 p-2 rounded-lg shadow-lg"><EmojiPicker onEmojiClick={handleEmoji} /></div>}
                </div>
                <button className="bg-blue-500 px-4 py-2 rounded-lg">Send</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h2 className="text-lg">Please log in to continue</h2>
        </div>
      )}
    </div>
  );
};

export default ChatApp;