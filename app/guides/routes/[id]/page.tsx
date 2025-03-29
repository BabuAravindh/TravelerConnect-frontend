"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bus, Train, Plane, Ship, Bike, Car } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const transportIcons = {
  Bus: <Bus className="text-blue-500" />,
  Train: <Train className="text-green-500" />,
  Flight: <Plane className="text-red-500" />,
  Ferry: <Ship className="text-purple-500" />,
  'Private Vehicle': <Car className="text-yellow-500" />,
  Bicycle: <Bike className="text-teal-500" />,
  Motorcycle: <Bike className="text-orange-500" />,
};

export default function RouteDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingChat, setRequestingChat] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch route');
        setRoute(data);
      } catch (error) {
        toast.error(error.message);
        router.push('/routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id, router]);

  const handleChatRequest = async () => {
    if (!user) {
      toast.error('Please sign in to request a chat');
      router.push('/login');
      return;
    }

   

    setRequestingChat(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
            customerId: user.id,
          guideId: route.guideId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');

      toast.success('Request sent to guide successfully!');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequestingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Route not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <button 
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Routes
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {route.from} → {route.to}
              </h1>
              
             
                <button
                  onClick={handleChatRequest}
                  disabled={requestingChat}
                  className="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center gap-2"
                >
                  {requestingChat ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      💬 Request Chat with Guide
                    </>
                  )}
                </button>
            
            </div>
            
            <div className="space-y-4 mb-8">
              {route.transports.map((transport) => (
                <div key={transport._id} className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {transportIcons[transport.mode] || <Bus className="text-gray-500" />}
                    <h3 className="text-lg font-semibold text-gray-800">{transport.mode}</h3>
                  </div>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p><span className="font-medium">Duration:</span> {transport.duration}</p>
                    {transport.details && (
                      <p><span className="font-medium">Details:</span> {transport.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t text-sm text-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Guide:</span>
                {route.guideId ? (
                  <span className="text-blue-600">{route.guideId.name} ({route.guideId.email})</span>
                ) : (
                  <span className="text-gray-500">No guide assigned</span>
                )}
              </div>
              <p className="mb-1"><span className="font-medium">Created:</span> {new Date(route.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Last updated:</span> {new Date(route.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}