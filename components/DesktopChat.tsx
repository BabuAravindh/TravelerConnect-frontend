import { useEffect, useState } from "react";

// Base API URL
const API_BASE_URL = "http://localhost:5000/api/chats";

// Helper function to get userId and token from localStorage
const getUserId = () => localStorage.getItem("userId");
const getToken = () => localStorage.getItem("token");
const token = getToken();
console.log("Authorization Token:", token);  // Check token value


const getUsers = async () => {
  const token = getToken();
  const userId = getUserId();
  if (!token || !userId) {
    console.error("Token or userId is missing");
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response status:", response.status); // Log response status

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const data = await response.json();
    console.log("Fetched users data:", data); // Log fetched data
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};



// Fetch Conversations
const getUserConversations = async () => {
  const userId = getUserId();
  if (!userId) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch conversations");

    const data = await response.json();
    return Array.isArray(data) ? data : data.conversations || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

// Fetch Messages for Selected Conversation
const getMessages = async (conversationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch messages");

    const data = await response.json();
    return Array.isArray(data) ? data : data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Send Message
const sendMessage = async (receiverId: string, message: string) => {
  const senderId = getUserId();
  const token = getToken();
  if (!senderId || !receiverId || !token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/send/${receiverId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Failed to send message");
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Chat Component
const ChatApp = () => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState<Array<{ senderId: string; message: string }>>([]);
  const [newMessage, setNewMessage] = useState("");

  // Load Users
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  // Load Conversations
  useEffect(() => {
    getUserConversations().then(setConversations);
  }, []);

  // Load Messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation._id).then(setMessages);
    }
  }, [selectedConversation]);

  // Send Message Handler
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.error("Message is empty");
      return;
    }
    if (!selectedConversation || !selectedConversation._id) {
      console.error("No conversation selected");
      return;
    }

    const senderId = getUserId();
    const receiver = selectedConversation.participants.find((p) => String(p._id) !== senderId);

    if (!receiver) {
      console.error("Receiver not found");
      return;
    }

    const response = await sendMessage(receiver._id, newMessage);
    if (response) {
      setMessages([...messages, { senderId, message: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat List (Users) */}
      <div className="w-1/3 bg-gray-900 h-screen p-4">
        <h2 className="text-lg font-bold text-white mb-4">Chats</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className={`flex items-center p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                selectedConversation?._id === user._id ? "bg-gray-700" : ""
              }`}
              onClick={() => setSelectedConversation(user)}
            >
              <div className="flex-1">
                <p className="font-semibold text-white">{user.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 bg-gray-800 h-screen flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-900 font-semibold border-b border-gray-700">
              {selectedConversation.name || "Unknown User"}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg, index) => {
                const isSentByUser = String(msg.senderId) === String(getUserId());

                return (
                  <div key={index} className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        isSentByUser ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                className="flex-1 p-2 bg-gray-900 text-white border border-gray-600 rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="ml-2 bg-blue-600 px-4 py-2 rounded-lg text-white" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
