"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useAuth } from "@/context/AuthContext"; // Adjust path as needed
import toast from "react-hot-toast";

// Interfaces for TypeScript
interface User {
  _id: string;
  name: string;
  role?: string;
  status?: string;
}

interface Message {
  _id: string;
  senderId: string | { _id: string; name: string };
  receiverId?: string | { _id: string; name: string };
  message: string;
  timestamp?: string;
  messageType?: string;
}

interface Conversation {
  _id: string;
  participants: User[];
}

interface Notification {
  _id: string;
  recipientId: string;
  senderId: { _id: string; name: string; avatar?: string };
  conversationId: string;
  type: "new_message" | "budget_message" | "typing";
  message: string;
  isRead: boolean;
  timestamp: string;
}

// API Base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Fetch function with headers and error handling
const fetchData = async <T>(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T | null> => {
  if (!token) {
    console.error("No token provided for request:", url);
    toast.error("Please log in to continue");
    return null;
  }
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
      const errorText = await response.text();
      console.error(`❌ Error fetching ${url}: ${response.status} - ${errorText}`);
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(`Failed to fetch data: ${response.statusText}`);
      }
      return null;
    }

    const data: T = await response.json();
    console.log(`✅ API Response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Fetch error on ${url}:`, error);
    toast.error("Network error occurred");
    return null;
  }
};

const useChat = () => {
  const { user, loading } = useAuth();
  const userId = user?.id || null;
  const role = user?.role || null;

  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Retrieve token from local storage and listen for changes
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Optional: Listen for storage events to handle token changes (e.g., logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch users and conversations
  useEffect(() => {
    if (!userId || !token || loading) return;

    Promise.all([
      fetchData<User[]>(`${API_BASE_URL}/chats`, token),
      fetchData<Conversation[]>(`${API_BASE_URL}/chats/user/${userId}`, token),
    ]).then(([usersData, conversationsData]) => {
      if (usersData) setUsers(usersData.filter((user) => user._id !== userId));
      if (conversationsData) {
        const updatedConversations = conversationsData.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((participant) => ({
            ...participant,
            role: participant.role || "User",
            status: participant.status || "Active",
          })),
        }));
        setConversations(updatedConversations);
      }
    });
  }, [userId, token, loading]);

  // Fetch notifications
  useEffect(() => {
    if (!userId || !token || loading) return;

    const fetchNotifications = async () => {
      const data = await fetchData<{ success: boolean; data: Notification[] }>(
        `${API_BASE_URL}/notifications/unread/${userId}`,
        token
      );
      if (data?.success && data.data) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n) => !n.isRead).length);
      } else {
        console.warn("No notifications data received");
      }
    };

    fetchNotifications();
  }, [userId, token, loading]);

  // Subscribe to Pusher for real-time messages and notifications
  useEffect(() => {
    if (!userId || !token || loading) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to notification channel
    const notificationChannel = pusher.subscribe(`notifications-${userId}`);
    notificationChannel.bind("new-notification", (data: Notification) => {
      console.log("📩 New notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      if (!data.isRead) {
        setUnreadCount((prev) => prev + 1);
        toast.success(
          data.type === "budget_message"
            ? `${data.senderId.name} sent a budget proposal`
            : `New message from ${data.senderId.name}`,
          { position: "top-right" }
        );
      }
    });

    notificationChannel.bind("notifications-read", (data: { notificationIds: string[] }) => {
      console.log("✅ Notifications marked as read:", data.notificationIds);
      setNotifications((prev) =>
        prev.map((n) => (data.notificationIds.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - data.notificationIds.length));
    });

    // Subscribe to conversation channel if selected
    let channel: Pusher.Channel | null = null;
    if (selectedConversation) {
      const channelName = `chat-${selectedConversation._id}`;
      console.log(`📢 Subscribing to Pusher channel: ${channelName}`);
      channel = pusher.subscribe(channelName);
      channel.bind("new-message", (newMessage: Message) => {
        console.log("📩 New message received:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      });
    }

    return () => {
      notificationChannel.unbind_all();
      pusher.unsubscribe(`notifications-${userId}`);
      if (channel && selectedConversation) {
        channel.unbind_all();
        pusher.unsubscribe(`chat-${selectedConversation._id}`);
      }
      pusher.disconnect();
    };
  }, [userId, token, selectedConversation, loading]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    setMessages([]);
    if (selectedConversation && token) {
      fetchData<Message[]>(`${API_BASE_URL}/chats/${selectedConversation._id}`, token).then((data) => {
        if (data) setMessages(data);
      });
    }
  }, [selectedConversation, token]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !userId || !token) return;

    // Validate budget message
    const budgetRegex = /^@budget\s+\d+$/i;
    if (budgetRegex.test(newMessage) && role !== "guide") {
      toast.error("Only guides can send budget messages");
      return;
    }

    const receiver = selectedConversation.participants.find((p) => p._id !== userId);
    if (!receiver) return;

    console.log("📤 Sending message to:", receiver._id);
    console.log("📨 Message Payload:", { senderId: userId, message: newMessage });

    const data = await fetchData<{ success: boolean }>(
      `${API_BASE_URL}/chats/send/${receiver._id}`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ senderId: userId, message: newMessage }),
      }
    );

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
        `${API_BASE_URL}/chats/startConversation`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ receiverId: user._id }),
        }
      );

      if (!response?.conversation) {
        console.error("❌ Failed to create conversation");
        toast.error("Failed to start conversation");
        return;
      }

      conversation = response.conversation;
      console.log("✅ Created new conversation:", conversation);
      setConversations((prev) => [...prev, conversation]);
    }

    setSelectedConversation(conversation);

    // Mark notifications for this conversation as read
    const conversationNotifications = notifications.filter(
      (n) => n.conversationId === conversation._id && !n.isRead
    );
    if (conversationNotifications.length > 0) {
      const notificationIds = conversationNotifications.map((n) => n._id);
      await fetchData<{ success: boolean }>(
        `${API_BASE_URL}/notifications/read/${userId}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify({ notificationIds }),
        }
      );
    }
  };

  // Fetch or create conversation
  const fetchOrCreateConversation = async (guideId: string) => {
    if (!userId || !token) return null;

    try {
      console.log(`Fetching conversation: ${API_BASE_URL}/chats/conversation/${userId}/${guideId}`);
      const response = await fetch(`${API_BASE_URL}/chats/conversation/${userId}/${guideId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data?.conversation) {
        setSelectedConversation(data.conversation);
        setConversations((prev) => {
          if (!prev.some((conv) => conv._id === data.conversation._id)) {
            return [...prev, data.conversation];
          }
          return prev;
        });
        return data.conversation;
      }

      // If no conversation exists, create one
      const createResponse = await fetch(`${API_BASE_URL}/chats/startConversation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: guideId }),
      });

      const createData = await createResponse.json();
      if (createData?.conversation) {
        setSelectedConversation(createData.conversation);
        setConversations((prev) => [...prev, createData.conversation]);
        return createData.conversation;
      }

      toast.error("Failed to create conversation");
      return null;
    } catch (error) {
      console.error("Error fetching/creating conversation:", error);
      toast.error("Network error occurred");
      return null;
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds: string[]) => {
    if (!token || !userId) return;

    const data = await fetchData<{ success: boolean }>(
      `${API_BASE_URL}/notifications/read/${userId}`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({ notificationIds }),
      }
    );

    if (data?.success) {
      setNotifications((prev) =>
        prev.map((n) => (notificationIds.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    }
  };

  // Debugging Logs
  useEffect(() => {
    console.log("🗂 Conversations:", conversations);
    console.log("🔔 Notifications:", notifications);
    console.log("🔢 Unread Count:", unreadCount);
    console.log("👤 Role:", role);
    console.log("🔑 Token:", token);
  }, [conversations, notifications, unreadCount, role, token]);

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
    role,
    fetchOrCreateConversation,
    notifications,
    unreadCount,
    markNotificationsAsRead,
  };
};

export default useChat;