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
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);

  // Trigger API automatically when city changes
  useEffect(() => {
    if (cityName && initialLoad) {
      setIsOpen(true);
      fetchInsights(`Tell me about ${cityName} including top attractions, local cuisine, and cultural tips`);
      setInitialLoad(false);
    }
  }, [cityName]);

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: `Hello! I'm your travel assistant for ${cityName || 'this city'}. Ask me anything!`,
        sender: 'bot'
      }]);
    }
  }, [isOpen, cityName]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    
    // Add user message to chat if it's a user query
    if (userQuery) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: userQuery,
        sender: 'user'
      }]);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/city-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          city: cityName,
          query: userQuery || `Tell me about ${cityName} including top attractions, local cuisine, and cultural tips`
        })
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

      // Add bot response to chat
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.insights,
        sender: 'bot',
        creditsUsed: 1,
        remainingCredits: data.remainingCredits
      }]);

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
      {/* Chat Toggle Button */}
      <button
        className="fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-primary hover:bg-gray-700 m-0 cursor-pointer border-gray-200 p-0 normal-case leading-5 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-white block border-gray-200 align-middle">
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px] shadow-lg">
          {/* Header */}
          <div className="flex flex-col space-y-1.5 pb-6">
            <h2 className="font-semibold text-lg tracking-tight">Travel Assistant</h2>
            <p className="text-sm text-[#6b7280] leading-3">Exploring {cityName || 'your destination'}</p>
          </div>

          {/* Chat Messages */}
          <div className="pr-4 h-[474px] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 my-4 text-gray-600 text-sm flex-1 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && (
                  <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                    <div className="rounded-full bg-gray-100 border p-1">
                      <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" height="20" width="20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                      </svg>
                    </div>
                  </span>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'bg-gray-100 text-gray-900'}`}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                  {message.creditsUsed && (
                    <div className="text-xs text-gray-500 mt-1">
                      Used {message.creditsUsed} credit • {message.remainingCredits} remaining
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                  <div className="rounded-full bg-gray-100 border p-1">
                    <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" height="20" width="20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                    </svg>
                  </div>
                </span>
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Getting insights about {cityName}...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center pt-0">
            <form onSubmit={handleSubmit} className="flex items-center justify-center w-full space-x-2">
              <input
                className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
                placeholder={`Ask about ${cityName || 'this city'}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-[#111827E6] h-10 px-4 py-2"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CityInsights;