"use client";

import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bus, Train, Plane, Ship, Bike, Car } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import GuideListing from '@/components/GuideListing';
import AttractionsCarousel from '@/components/Attraction';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import { fetchRoute, sendChatRequest } from './routes.service';
import { Route } from './routesType';

const transportIcons: { [key: string]: JSX.Element } = {
  Bus: <Bus className="w-5 h-5" />,
  Train: <Train className="w-5 h-5" />,
  Flight: <Plane className="w-5 h-5" />,
  Ferry: <Ship className="w-5 h-5" />,
  'Private Vehicle': <Car className="w-5 h-5" />,
  Bicycle: <Bike className="w-5 h-5" />,
  Motorcycle: <Bike className="w-5 h-5" />,
};

export default function RouteDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingChat, setRequestingChat] = useState(false);

  useEffect(() => {
    const loadRoute = async () => {
      try {
        if (typeof id !== 'string') {
          throw new Error('Invalid route ID');
        }
        const routeData = await fetchRoute(id);
        setRoute(routeData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
        router.push('/routes');
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [id, router]);

  const handleChatRequest = async () => {
    if (!user) {
      toast.error('Please sign in to request a chat');
      router.push('/login');
      return;
    }

    setRequestingChat(true);
    try {
      await sendChatRequest(user.id, route?.guideId, user.token);
      toast.success('Request sent to guide successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setRequestingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 text-lg">Route not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Routes
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {route.from} → {route.to}
                </h1>
                
                {route.guideId && (
                  <button
                    onClick={handleChatRequest}
                    disabled={requestingChat}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
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
                      'Request Chat with Guide'
                    )}
                  </button>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Transport Options</h2>
                {route.transports.map((transport) => (
                  <div key={transport._id} className="border-l-2 border-gray-300 pl-4 py-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 mb-1">
                      {transportIcons[transport.mode] || <Bus className="w-5 h-5" />}
                      <h3 className="text-base font-medium text-gray-900">{transport.mode}</h3>
                    </div>
                    <div className="space-y-1 text-gray-700 ml-8">
                      <p><span className="font-medium">Duration:</span> {transport.duration}</p>
                      {transport.details && (
                        <p><span className="font-medium">Details:</span> {transport.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Guide:</span>
                  {route.guideId ? (
                    <span className="text-gray-900">{route.guideId.name} ({route.guideId.email})</span>
                  ) : (
                    <span className="text-gray-500">No guide assigned</span>
                  )}
                </div>
                <p><span className="font-medium">Created:</span> {new Date(route.createdAt).toLocaleString()}</p>
                <p><span className="font-medium">Last updated:</span> {new Date(route.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attractions in {route.from}</h2>
            <AttractionsCarousel selectedCity={route.from} />
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Guides in {route.from}</h2>
            <GuideListing city={route.from} searchTerm={''} language={''} activity={''} gender={''} loading={false} />
          </section>
          <ReviewForm entityId={id as string} entityType="route" />
          <ReviewList entityId={id as string} entityType="route" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}