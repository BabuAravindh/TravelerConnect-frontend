'use client';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import AIRecommendation from '@/services/AiRecommendations';

interface Guide {
  _id: string;
  userId: string;
  languages: string[];
  bio: string;
  activities: string[];
  bankAccountNumber: string;
  serviceLocations: string[];
  updatedAt: string;
  active: boolean;
  maskedBankAccount?: string;
  bankName?: string;
  ifscCode?: string;
  profilePic?: {
    public_id: string;
    url: string;
    secure_url: string;
    uploadedAt: string;
  };
  aadharCardPhoto?: {
    public_id: string;
    url: string;
    secure_url: string;
    uploadedAt: string;
    _id?: string;
    id?: string;
  };
  rejectionReason?: string;
  verificationStatus?: string;
  name?: string;
  email?: string;
  role?: string;
  verificationToken?: string | null;
  isVerified?: boolean;
  credits?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  gender?: string;
  dateJoined?: string;
  address?: {
    stateId?: {
      _id: string;
      stateName: string;
    };
    countryId?: string;
  };
  state?: string;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  type?: 'text' | 'options' | 'number' | 'date' | 'common' | 'guideList' | 'itinerary';
  isError?: boolean;
  guides?: Guide[];
}

const UI = ({ city }: { city?: string }) => {
  const {
    messages,
    userInput,
    setUserInput,
    isLoading,
    questions,
    currentStep,
    error,
    creditRequestStatus,
    planId,
    chatContainerRef,
    handleSendMessage,
    handleOptionSelect,
    handlePostItineraryAction,
    handleRequestCredits,
    resetChat,
    selectedCity,
  } = AIRecommendation({ city });

  const formatItineraryText = (text: string) => {
    // Split into sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      if (section.startsWith('Day')) {
        return (
          <div key={index} className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">{section.split('\n')[0]}</h3>
            <ul className="space-y-2">
              {section.split('\n').slice(1).map((line, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      } else if (section.startsWith('Hotel Recommendations')) {
        return (
          <div key={index} className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Where to Stay</h3>
            <ul className="space-y-3">
              {section.split('\n').slice(1).filter(line => line.trim()).map((line, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      } else if (section.includes('Travel plan ID')) {
        return null; // We'll handle this separately
      } else {
        return (
          <p key={index} className="text-gray-700 mb-4">
            {section}
          </p>
        );
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
            className="w-10 h-10 md:w-12 md:h-12 mr-3 text-green-600"
            fill="currentColor"
          >
            <path d="M320 96a96 96 0 1 0 0 192 96 96 0 1 0 0-192zM128 256c0-106 86-192 192-192s192 86 192 192c0 81.5-50.7 151.4-122.4 179.7l-1.2 4.5c-2.4 9-.7 18.4 4.5 25.9s14.3 11.9 23.7 11.9H448c8.8 0 16 7.2 16 16s-7.2 16-16 16H391.7c-22.4 0-43.8-7.7-60.6-21.6l-9.2-7.4c-5.9-4.7-9.4-11.9-9.4-19.4c0-13.3 10.7-24 24-24h72.5l1.4-5.1C378.7 376.3 416 320.4 416 256c0-53-43-96-96-96s-96 43-96 96c0 35.1 18.9 65.8 47 82.9v45.4c-28.2-14.1-47-44.6-47-82.9c0-11.4 2-22.3 5.6-32.3c-12.9-4.6-26.5-7.1-40.8-7.1c-5.3 0-10.6 .3-15.8 .9c-1.5-10.6-2.4-21.4-2.4-32.4C128 150 214 64 320 64s192 86 192 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C165 499 48 343.4 48 256c0-17.7 14.3-32 32-32s32 14.3 32 32z" />
          </svg>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">TripPlanner AI</h1>
        </div>
        <p className="text-gray-600 text-center max-w-lg">
          {selectedCity 
            ? `Planning your perfect trip to ${selectedCity}`
            : "Let's plan your next adventure"}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Travel Assistant</h2>
            <p className="text-green-100 text-sm">
              {selectedCity ? `Customizing your ${selectedCity} experience` : "Ready to help plan your trip"}
            </p>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[32rem] md:h-[36rem] p-4 md:p-6 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[90%] md:max-w-lg rounded-xl px-4 py-3 ${
                  message.sender === 'bot'
                    ? message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    : 'bg-green-600 text-white'
                }`}
              >
                {message.type === 'itinerary' || (message.sender === 'bot' && message.text.includes('Day')) ? (
                  <div className="itinerary-container">
                    {formatItineraryText(message.text)}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}

                {message.options && (message.type === 'options' || message.type === 'common') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          userInput === option
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`Select ${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {message.type === 'guideList' && message.guides && (
                  <div className="mt-3 space-y-3">
                    <h4 className="font-medium text-gray-800 mb-2">Available Guides:</h4>
                    {message.guides.map((guide) => (
                      <div
                        key={guide._id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={guide.profilePic?.secure_url || '/placeholder-profile.jpg'}
                            alt={`Guide profile`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">
                              {guide.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {guide.bio || 'No bio provided'}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {guide.languages.length > 0 ? (
                                guide.languages.slice(0, 3).map(lang => (
                                  <span key={lang} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {lang}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                  No languages listed
                                </span>
                              )}
                            </div>
                            <button
                              className="mt-2 text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              onClick={() => alert(`Contact guide via TravelerConnect`)}
                            >
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-xl px-4 py-3 border border-gray-200 shadow-sm flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                <span className="text-gray-600">Processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 md:p-6 bg-white">
          {error && error.toLowerCase().includes("insufficient credits") && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <div className="mt-2">
                  {creditRequestStatus === 'idle' ? (
                    <button
                      onClick={handleRequestCredits}
                      disabled={isLoading}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Request Credits
                    </button>
                  ) : creditRequestStatus === 'requesting' ? (
                    <div className="flex items-center text-gray-600 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Processing...
                    </div>
                  ) : creditRequestStatus === 'success' ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Request sent!
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">Failed to request credits</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(!questions?.length || (currentStep < questions.length && questions[currentStep])) && !isLoading && (
            <div className="space-y-3">
              {questions[currentStep] && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {questions[currentStep].questionText}
                  </label>
                  {questions[currentStep].type === 'options' || questions[currentStep].type === 'common' || questions[currentStep].type === 'guidePrompt' ? (
                    <div className="flex flex-wrap gap-2">
                      {questions[currentStep].options?.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleOptionSelect(option)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            userInput === option
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={
                        questions[currentStep].type === 'date' ? 'date' :
                        questions[currentStep].type === 'number' ? 'number' : 'text'
                      }
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        questions[currentStep].type === 'date' ? 'Select date' :
                        questions[currentStep].type === 'number' ? 'Enter number' :
                        'Type your answer...'
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoading}
                    />
                  )}
                </div>
              )}
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Submit
              </button>
            </div>
          )}

          {planId && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-green-800">
                  <span className="font-medium">Trip ID:</span> {planId}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Save this ID to retrieve your plan later
                </p>
                <button
                  onClick={resetChat}
                  className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  Start New Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UI;