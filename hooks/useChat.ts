import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import useAuth from "@/hooks/useAuth";

// Interfaces for Typescript
interface User {
  _id: string;
  name: string;
}

interface Message {
  _id: string;
  senderId: string | { _id: string };
  message: string;
  timestamp?: string;
}

interface Conversation {
  _id: string;
  participants: User[];
}

// API Base URL (update if needed)
const API_BASE_URL = "http://localhost:5000/api/chats";

// Fetch function with headers and error handling
const fetchData = async <T>(url: string, token: string | null, options: RequestInit = {}): Promise<T | null> => {
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

    if (!response.ok) {
      console.error(`❌ Error fetching ${url}:`, response.statusText);
      return null;
    }

    const data: T = await response.json();
    console.log(`✅ API Response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Fetch error on ${url}:`, error);
    return null;
  }
};

const useChat = () => {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  // Retrieve token from local storage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!userId || !token) return;
  
    Promise.all([
      fetchData<User[]>(`${API_BASE_URL}`, token),
      fetchData<Conversation[]>(`${API_BASE_URL}/user/${userId}`, token),
    ]).then(([usersData, conversationsData]) => {
      if (usersData) setUsers(usersData.filter((user) => user._id !== userId));
      if (conversationsData) setConversations(conversationsData);
    });
  }, [userId, token]);
  

  // Subscribe to Pusher for real-time messages
  useEffect(() => {
    if (!selectedConversation) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = `chat-${selectedConversation._id}`;
    console.log(`📢 Subscribing to Pusher channel: ${channelName}`);

    const channel = pusher.subscribe(channelName);
    channel.bind("new-message", (newMessage: Message) => {
      console.log("📩 New message received:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      console.log(`🛑 Unsubscribing from Pusher channel: ${channelName}`);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selectedConversation]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    setMessages([]); // Clear old messages when switching conversations
    if (selectedConversation && token) {
      fetchData<Message[]>(`${API_BASE_URL}/${selectedConversation._id}`, token).then((data) => {
        if (data) setMessages(data);
      });
    }
  }, [selectedConversation, token]);
  

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !userId || !token) return;

    const receiver = selectedConversation.participants.find((p) => p._id !== userId);
    if (!receiver) return;

    console.log("📤 Sending message to:", receiver._id);
    console.log("📨 Message Payload:", { senderId: userId, message: newMessage });

    const data = await fetchData<{ success: boolean }>(`${API_BASE_URL}/send/${receiver._id}`, token, {
      method: "POST",
      body: JSON.stringify({ senderId: userId, message: newMessage }),
    });

    if (data?.success) {
      setNewMessage("");
    }
  };

  // Handle selecting a user (start or fetch conversation)
  const handleSelectUser = async (user: User) => {
    let conversation = conversations.find((conv) =>
      conv.participants.some((p) => p._id === user._id)
    );

    if (!conversation) {
      console.log("➕ No existing conversation, creating a new one...");

      const response = await fetchData<{ conversation: Conversation }>(
        `${API_BASE_URL}/startConversation`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ receiverId: user._id }),
        }
      );

      if (!response?.conversation) {
        console.error("❌ Failed to create conversation");
        return;
      }

      conversation = response.conversation;
      console.log("✅ Created new conversation:", conversation);

      setConversations((prev) => [...prev, ...(conversation ? [conversation] : [])]);
    }

    setSelectedConversation(conversation);
  };

  // Debugging Logs
  useEffect(() => {
    console.log("🗂 Conversations:", conversations);
  }, [conversations]);

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
    userId,
  };
};

export default useChat;
