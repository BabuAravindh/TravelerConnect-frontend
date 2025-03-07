const API_BASE_URL = "http://localhost:5000/api/chats";

const getUserId = () => localStorage.getItem("userId"); // Retrieve userId from localStorage

export const getUserConversations = async () => {
  const userId = getUserId();
  if (!userId) {
    console.error("No userId found in localStorage");
    return [];
  }

  try {
    const url = `${API_BASE_URL}/user/${userId}`;
    console.log("Fetching conversations from:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.statusText}`);

    const data = await response.json();
    console.log("Conversations API Response:", data);

    // Ensure data is an array
    const conversations = Array.isArray(data) ? data : data.conversations || [];

    // Sort conversations by last message time (latest first)
    return conversations
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
      .map((conv) => {
        const otherUser = conv.participants.find((p) => String(p._id) !== String(userId));
        return {
          id: conv._id,
          otherUser: {
            name: otherUser?.name || "Unknown",
            email: otherUser?.email || "",
          },
          lastMessageTime: conv.lastMessageTime,
          lastMessage: conv.lastMessage || "No messages yet",
        };
      });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const getMessages = async (conversationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (conversationId: string, message: string) => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, sender: userId, message }),
    });

    if (!response.ok) throw new Error("Failed to send message");
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
