import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import useAuth from "@/hooks/useAuth";

interface User {
  _id: string;
  name: string;
}

interface Message {
  senderId: string | { _id: string };
  message: string;
}

interface Conversation {
  _id: string;
  participants: User[];
}

const API_BASE_URL = "http://localhost:5000/api/chats";

const fetchData = async (url: string, token: string | null, options: RequestInit = {}) => {
  if (!token) return null;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok ? response.json() : null;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const useChat = () => {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token") || null);
  }, []);

  useEffect(() => {
    if (!userId || !token) return;

    fetchData(`${API_BASE_URL}/`, token).then(setUsers);
    fetchData(`${API_BASE_URL}/user/${userId}`, token).then(setConversations);
  }, [userId, token]);

  useEffect(() => {
    if (!selectedConversation || !token) return;

    fetchData(`${API_BASE_URL}/${selectedConversation._id}`, token).then(setMessages)

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`chat-${selectedConversation._id}`);

    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selectedConversation, token]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !userId || !token) return;

    const receiver = selectedConversation.participants.find((p) => p._id !== userId);
    if (!receiver) return;

    const data = await fetchData(`${API_BASE_URL}/send/${receiver._id}`, token, {
      method: "POST",
      body: JSON.stringify({ senderId: userId, message: newMessage }),
    });

    if (data?.success) {
      setMessages((prev) => [...prev, { senderId: userId, message: newMessage }]);
      setNewMessage("");
    }
  };

  const handleSelectUser = async (user: User) => {
    // Check if conversation already exists
    let conversation = conversations.find((conv) =>
      conv.participants.some((p) => p._id === user._id)
    );
  
    if (!conversation) {
      console.log("No existing conversation, creating a new one...");
      
      // Call API to create a new conversation
      const newConversation = await fetch("http://localhost:5000/api/chats/start-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use actual token
        },
        body: JSON.stringify({ receiverId: user._id }),
      })
      .then(res => res.json())
      .catch(error => {
        console.error("Error creating conversation:", error);
        return null;
      });
      
      console.log("API Response:", newConversation);
      
      if (!newConversation || !newConversation._id) {
        console.error("Failed to create a new conversation");
        return;
      }
  
      // Update state with new conversation
      setConversations((prev) => [...prev, newConversation]);
      conversation = newConversation; // Assign to selected conversation
    }
  
    // Set the selected conversation
    setSelectedConversation(conversation);
  };
  

  return {
    users,
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleSelectUser,
    userId
  };
};

export default useChat;
