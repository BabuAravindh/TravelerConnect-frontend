"use client";
import { useState, useEffect } from "react";

const REVIEWS_PER_PAGE = 3;

type ReviewEntityType = 'guide' | 'attraction' | 'route';

interface ReviewListProps {
  entityId: string;
  entityType: ReviewEntityType;
}

interface User {
  _id: string;
  name: string;
}

interface Feedback {
  _id: string;
  userId: User;
  rating: number;
  comments: string;
  status: string;
  submittedAt: string;
  __v: number;
  // Entity-specific fields
  guideId?: string;
  attractionId?: string;
  routeId?: string;
}

interface RouteResponse {
  _id: string;
  from: string;
  to: string;
  transports: {
    mode: string;
    duration: string;
    details: string;
    _id: string;
  }[];
  guideId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  route?: RouteResponse;
  attraction?: {
    _id: string;
    name: string;
    // ... other attraction fields
  };
  feedbacks?: Feedback[];
}

const ReviewList = ({ entityId, entityType }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityDetails, setEntityDetails] = useState({
    name: "",
    from: "",
    to: ""
  });

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getApiEndpoint = () => {
    switch (entityType) {
      case 'guide': return `api/feedback/${entityId}`;
      case 'attraction': return `api/attractions/feedback/attraction/${entityId}`;
      case 'route': return `api/routes/feedback/routes/${entityId}`;
      default: return `api/feedback/${entityId}`;
    }
  };

  const getEntityName = () => {
    switch (entityType) {
      case 'guide': return 'Guide';
      case 'attraction': return entityDetails.name || 'Attraction';
      case 'route': return `Route: ${entityDetails.from} → ${entityDetails.to}`;
      default: return 'Item';
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!entityId) return;

      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) throw new Error("Authentication token not found");

        const endpoint = getApiEndpoint();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${entityType} reviews: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        
        // Set entity-specific details
        if (entityType === 'attraction' && data.attraction) {
          setEntityDetails(prev => ({ ...prev, name: data.attraction?.name || "" }));
        } else if (entityType === 'route' && data.route) {
          setEntityDetails({
            name: "",
            from: data.route.from,
            to: data.route.to
          });
        }
        
        setReviews(data.feedbacks || []);
        // Assuming 1 page if no pagination info is returned
        setTotalPages(1);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [entityId, entityType, currentPage]);

  return (
    <div className="lg:col-span-2 flex flex-col space-y-6 p-6 max-w-full mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">
        {getEntityName()} Reviews
      </h3>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500">
          No reviews yet. Be the first to review this {entityType}!
        </p>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review._id} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-800 text-lg font-medium">{review.comments}</p>
              <p className="text-sm text-gray-600 mt-2">
                - {review.userId?.name || "Anonymous"}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;