'use client';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import AIRecommendation from '@/services/AiRecommendations';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plane, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  SendHorizonal, 
  AlertTriangle,
  Check,
  Info,
  CircleDollarSign
} from 'lucide-react';

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
        return null;
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
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              <Plane className="w-10 h-10 md:w-12 md:h-12 mr-3 text-primary" />
              <CardTitle className="text-3xl md:text-4xl font-bold">
                TripPlanner AI
              </CardTitle>
            </div>
            <CardDescription>
              {selectedCity 
                ? `Planning your perfect trip to ${selectedCity}`
                : "Let's plan your next adventure"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4 flex flex-row items-center space-y-0">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Travel Assistant</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {selectedCity ? `Customizing your ${selectedCity} experience` : "Ready to help plan your trip"}
                </CardDescription>
              </div>
            </CardHeader>

            <ScrollArea
              ref={chatContainerRef}
              className="h-[32rem] md:h-[36rem] p-4 md:p-6 bg-muted/50"
            >
              <div className="flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <Card
                      className={`max-w-[90%] md:max-w-lg ${
                        message.sender === 'bot'
                          ? message.isError
                            ? 'bg-destructive/10 text-destructive border-destructive'
                            : 'bg-background'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <CardContent className="p-4">
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
                              <Button
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isLoading}
                                variant={userInput === option ? "default" : "outline"}
                                size="sm"
                                className={`${
                                  userInput === option
                                    ? ''
                                    : 'text-primary hover:bg-primary/10'
                                }`}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}

                        {message.type === 'guideList' && message.guides && (
                          <div className="mt-3 space-y-3">
                            <h4 className="font-medium">Available Guides:</h4>
                            {message.guides.map((guide) => (
                              <Card key={guide._id} className="p-3">
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarImage src={guide.profilePic?.secure_url} />
                                    <AvatarFallback>
                                      {guide.name?.charAt(0) || 'G'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h3 className="font-medium">
                                      {guide.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {guide.bio || 'No bio provided'}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {guide.languages.length > 0 ? (
                                        guide.languages.slice(0, 3).map(lang => (
                                          <Badge key={lang} variant="secondary">
                                            {lang}
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge variant="outline">
                                          No languages listed
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => alert(`Contact guide via TravelerConnect`)}
                                    >
                                      Contact
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="flex items-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
                      <span>Processing...</span>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>

            <CardFooter className="border-t p-4 md:p-6 flex flex-col gap-4">
              {error && error.toLowerCase().includes("insufficient credits") && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Credit Issue</AlertTitle>
                  <AlertDescription>
                    {error}
                    <div className="mt-2">
                      {creditRequestStatus === 'idle' ? (
                        <Button
                          onClick={handleRequestCredits}
                          disabled={isLoading}
                          size="sm"
                        >
                          <CircleDollarSign className="h-4 w-4 mr-1.5" />
                          Request Credits
                        </Button>
                      ) : creditRequestStatus === 'requesting' ? (
                        <div className="flex items-center text-sm">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : creditRequestStatus === 'success' ? (
                        <div className="flex items-center text-sm text-success">
                          <Check className="h-4 w-4 mr-1.5" />
                          Request sent!
                        </div>
                      ) : (
                        <p className="text-destructive text-sm">Failed to request credits</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {(!questions?.length || (currentStep < questions.length && questions[currentStep])) && !isLoading && (
                <div className="space-y-3 w-full">
                  {questions[currentStep] && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {questions[currentStep].questionText}
                      </label>
                      {questions[currentStep].type === 'options' || questions[currentStep].type === 'common' || questions[currentStep].type === 'guidePrompt' ? (
                        <div className="flex flex-wrap gap-2">
                          {questions[currentStep].options?.map((option) => (
                            <Button
                              key={option}
                              onClick={() => handleOptionSelect(option)}
                              disabled={isLoading}
                              variant={userInput === option ? "default" : "outline"}
                              size="sm"
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Input
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
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    className="w-full"
                  >
                    <SendHorizonal className="h-4 w-4 mr-1.5" />
                    Submit
                  </Button>
                </div>
              )}

              {planId && (
                <Alert>
                  <Info className="h-5 w-5" />
                  <AlertTitle>Trip ID: {planId}</AlertTitle>
                  <AlertDescription>
                    Save this ID to retrieve your plan later
                    <Button
                      onClick={resetChat}
                      size="sm"
                      className="mt-2"
                    >
                      Start New Plan
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default UI;