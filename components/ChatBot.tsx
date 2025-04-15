"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const CityInsights = ({ cityName }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);
  const hasMounted = useRef(false);

  // Fetch previous AI interactions for the user
  const fetchPreviousResponses = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch previous responses');

      const interactions = await response.json();
      // Filter by cityName only if provided
      const filteredInteractions = cityName
        ? interactions.filter((int) => int.query.toLowerCase().includes(cityName.toLowerCase()))
        : interactions;

      // Map interactions to message format
      const interactionMessages = filteredInteractions.map((int) => ({
        id: int._id,
        text: int.response,
        fullText: int.response,
        sender: 'bot',
        animated: false,
        timestamp: new Date(int.createdAt),
        userQuery: int.query,
      }));

      // Merge with existing messages, avoiding duplicates
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const newMessages = interactionMessages.filter((msg) => !existingIds.has(msg.id));
        return [
          ...prev.filter((msg) => msg.id === 1 || msg.sender === 'user'), // Keep welcome message and user queries
          ...newMessages,
        ].sort((a, b) => (a.timestamp || new Date()) - (b.timestamp || new Date()));
      });
    } catch (error) {
      console.error('Error fetching previous responses:', error);
      toast.error('Could not load previous responses');
    }
  };

  // Initial setup
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Set welcome message
    setMessages([
      {
        id: 1,
        text: `Hello! I'm your travel assistant${cityName ? ` for ${cityName}` : ''}. Ask me anything!`,
        sender: 'bot',
        animated: false,
        timestamp: new Date(),
      },
    ]);

    // Fetch previous responses immediately
    fetchPreviousResponses();

    // Auto-fetch insights if cityName exists
    if (cityName) {
      setIsOpen(true);
      fetchInsights();
      setInitialLoad(false);
    }
  }, [user?.id]);

  // Re-fetch responses when cityName changes
  useEffect(() => {
    if (hasMounted.current && cityName) {
      fetchPreviousResponses();
    }
  }, [cityName]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Typewriter effect for new responses
  useEffect(() => {
    if (typing) {
      const lastMessage = messages[messages.length - 1];
      if (currentTypingIndex < lastMessage.fullText.length) {
        const timer = setTimeout(() => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: lastMessage.fullText.substring(0, currentTypingIndex + 1),
            };
            return newMessages;
          });
          setCurrentTypingIndex(currentTypingIndex + 1);
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setTyping(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            animated: false,
          };
          return newMessages;
        });
      }
    }
  }, [typing, currentTypingIndex, messages]);

  const fetchInsights = async (userQuery = '') => {
    if (!user?.id) {
      toast.error('Please login to get AI insights');
      return;
    }

    if (!cityName || cityName.trim() === '') {
      toast.error('Please select a city first');
      return;
    }

    setLoading(true);

    if (userQuery) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: userQuery,
          sender: 'user',
          animated: false,
          timestamp: new Date(),
        },
      ]);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/city-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          city: cityName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error(data.message || 'You need more credits to get insights');
        } else {
          throw new Error(data.error || 'Failed to get insights');
        }
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: '',
          fullText: data.insights,
          sender: 'bot',
          creditsUsed: 1,
          remainingCredits: data.remainingCredits,
          animated: true,
          timestamp: new Date(),
          userQuery,
        },
      ]);

      setTyping(true);
      setCurrentTypingIndex(0);

      // Refresh previous responses
      await fetchPreviousResponses();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      fetchInsights(input);
      setInput('');
    }
  };

  return (
    <>
      <button
        className={`fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-primary hover:bg-gray-700 m-0 cursor-pointer border-gray-200 p-0 normal-case leading-5 hover:text-gray-900 ${
          initialLoad ? '' : 'animate-pulse'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && initialLoad && cityName) {
            fetchInsights();
            setInitialLoad(false);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white block border-gray-200 align-middle"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px] shadow-lg animate-slide-up">
          <div className="flex flex-col space-y-1.5 pb-6">
            <h2 className="font-semibold text-lg tracking-tight">Travel Assistant</h2>
            <p className="text-sm text-[#6b7280] leading-3">Exploring {cityName || 'your destination'}</p>
          </div>

          <div className="pr-4 h-[474px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 my-4 text-gray-600 text-sm flex-1 ${
                  message.sender === 'user' ? 'justify-end' : ''
                } ${message.animated ? 'animate-fade-in' : ''}`}
              >
                {message.sender === 'bot' && (
                  <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                    <div className="rounded-full bg-gray-100 border p-1">
                      <svg
                        stroke="none"
                        fill="black"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        height="20"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        ></path>
                      </svg>
                    </div>
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                  } ${message.animated ? 'transition-all duration-100' : ''}`}
                >
                  {message.userQuery && message.sender === 'bot' && (
                    <div className="text-xs text-gray-500 mb-1">You asked: {message.userQuery}</div>
                  )}
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                  {message.creditsUsed && !message.animated && (
                    <div className="text-xs text-gray-500 mt-1 animate-fade-in">
                      Used {message.creditsUsed} credit • {message.remainingCredits} remaining
                    </div>
                  )}
                  {message.animated && currentTypingIndex < message.fullText.length && (
                    <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-blink"></span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1 animate-fade-in">
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                  <div className="rounded-full bg-gray-100 border p-1">
                    <svg
                      stroke="none"
                      fill="black"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      ></path>
                    </svg>
                  </div>
                </span>
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Getting insights about {cityName}...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center pt-0">
            <form onSubmit={handleSubmit} className="flex items-center justify-center w-full space-x-2">
              <input
                className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2 transition-all duration-200 focus:border-blue-300"
                placeholder={`Ask about ${cityName || 'this city'}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || typing}
              />
              <button
                type="submit"
                disabled={loading || typing || !input.trim()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-[#111827E6] h-10 px-4 py-2 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default CityInsights;