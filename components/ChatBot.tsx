"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number | string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  userQuery?: string;
  remainingCredits?: number;
  isConfirmationPrompt?: boolean;
}

interface CityInsightsProps {
  cityName: string;
  onCityInferred?: (city: string) => void;
}

const CityInsights: React.FC<CityInsightsProps> = ({ cityName, onCityInferred }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || null;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const detectCityFromQuery = (query: string): string | null => {
    const cities = ["chennai", "mumbai", "delhi", "bangalore", "jaipur"];
    const lowerQuery = query.toLowerCase();
    return cities.find((city) => lowerQuery.includes(city)) || null;
  };

  const formatTimestamp = (date: Date) =>
    date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

  // Fetch previous responses when chat opens
  useEffect(() => {
    if (!isOpen || authLoading || !userId) {
      if (!userId && isOpen) {
        setMessages([
          {
            id: Date.now(),
            text: "Please log in to use the travel assistant.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
      return;
    }

    const fetchPreviousResponses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 404 && data.message === "No AI chat responses found for this user.") {
            setMessages([
              {
                id: Date.now(),
                text: "No previous messages yet. Ask me something!",
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
            return;
          }
          throw new Error(data.message || data.error || "Failed to fetch previous responses");
        }

        const responses = Array.isArray(data.responses) ? data.responses : [];
        if (responses.length === 0) {
          setMessages([
            {
              id: Date.now(),
              text: "No previous messages yet. Ask me something!",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }

        const previousMessages: Message[] = responses
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((item: any) => [
            {
              id: `${item._id}-user`,
              text: item.query || "Unknown query",
              sender: "user",
              timestamp: new Date(item.createdAt || Date.now()),
            },
            {
              id: item._id,
              text: item.response || "No response available",
              sender: "bot",
              timestamp: new Date(item.createdAt || Date.now()),
              userQuery: item.query,
            },
          ])
          .flat();

        setMessages(previousMessages);
      } catch (error: any) {
        console.error("Error fetching previous responses:", error);
        toast.error(error.message || "Failed to load previous messages.", {
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
        setMessages([
          {
            id: Date.now(),
            text: "Sorry, I couldn't load previous messages. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousResponses();
  }, [isOpen, authLoading, userId]);

  // Prompt for city insights confirmation
  useEffect(() => {
    if (!isOpen || authLoading || !userId || !cityName || cityName.trim() === "" || awaitingConfirmation) return;

    const promptMessage: Message = {
      id: Date.now(),
      text: `You have selected ${cityName} for insights. Shall I proceed with the insights?`,
      sender: "bot",
      timestamp: new Date(),
      isConfirmationPrompt: true,
    };

    setMessages((prev) => [...prev, promptMessage]);
    setAwaitingConfirmation(true);
  }, [isOpen, authLoading, userId, cityName, awaitingConfirmation]);

  // Fetch city insights after confirmation
  const fetchCityInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai//city-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, city: cityName }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          toast.info(data.message || "You need at least 1 credit to fetch city insights. Please request more credits.", {
            style: { background: "#e0f2fe", color: "#1e40af" },
          });
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: data.message || "You need at least 1 credit to fetch city insights. Please request more credits.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }
        throw new Error(data.message || data.error || "Failed to fetch city insights");
      }

      const botMessage: Message = {
        id: data.interactionId || Date.now(),
        text: data.insights || data.response || "No insights available",
        sender: "bot",
        timestamp: new Date(data.timestamp || Date.now()),
        remainingCredits: data.remainingCredits,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error fetching city insights:", error);
      toast.error(error.message || "Failed to load city insights.", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I couldn't fetch insights for this city. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setAwaitingConfirmation(false);
    }
  };

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!userId) {
      toast.info("Please log in to send messages.", {
        style: { background: "#e0f2fe", color: "#1e40af" },
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check if awaiting confirmation for city insights
    if (awaitingConfirmation) {
      const lowerInput = input.toLowerCase();
      const affirmativeResponses = ["yes", "y", "ok", "proceed", "sure", "yeah"];
      const negativeResponses = ["no", "n", "cancel", "stop"];

      if (affirmativeResponses.includes(lowerInput)) {
        await fetchCityInsights();
        return;
      } else if (negativeResponses.includes(lowerInput)) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Okay, I won't fetch the city insights. Ask me something else!",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setAwaitingConfirmation(false);
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Please respond with 'yes' or 'no' to proceed or cancel the city insights.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        return;
      }
    }

    // Proceed with regular query or city-inferred query
    setIsLoading(true);
    try {
      const inferredCity = detectCityFromQuery(input);
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ai`;
      let body: any = { userId, query: input };

      if (inferredCity && (!cityName || cityName.trim() === "")) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ai/city-insights`;
        body = { userId, city: inferredCity };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          toast.info(data.message || "You need at least 1 credit to process this query. Please request more credits.", {
            style: { background: "#e0f2fe", color: "#1e40af" },
          });
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: data.message || "You need at least 1 credit to process this query. Please request more credits.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }
        throw new Error(data.message || data.error || "Failed to fetch response");
      }

      const botMessage: Message = {
        id: data.interactionId || Date.now(),
        text: data.insights || data.response || "No response available",
        sender: "bot",
        timestamp: new Date(data.timestamp || Date.now()),
        userQuery: data.query,
        remainingCredits: data.remainingCredits,
      };

      if (data.responseStatus === "error" || data.responseStatus === "timeout") {
        throw new Error(data.response || "Sorry, there was an issue processing your query.");
      }

      setMessages((prev) => [...prev, botMessage]);

      if (inferredCity && (!cityName || cityName.trim() === "")) {
        onCityInferred?.(inferredCity);
      }
    } catch (error: any) {
      console.error("Error processing query:", error);
      toast.error(error.message || "Failed to process your query.", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-opacity-90 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-50 h-[70vh]">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Travel Assistant</h2>
              <p className="text-xs text-blue-100">
                {cityName ? `Exploring ${cityName}` : "Ask me anything about travel"}
                {messages.some((msg) => msg.remainingCredits !== undefined) && (
                  <span className="ml-2">• Credits: {messages[messages.length - 1].remainingCredits}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white focus:outline-none"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-button text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                  <div className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 shadow-sm max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={awaitingConfirmation ? "Type 'yes' or 'no'..." : cityName ? `Ask about ${cityName}...` : "Ask something..."}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={isLoading || !userId}
                aria-label="Type your message"
              />
              <button
                type="submit"
                className="bg-button hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
                disabled={isLoading || !userId}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default CityInsights;