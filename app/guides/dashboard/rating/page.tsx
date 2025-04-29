"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchReviews } from "./rating.service";
import { Review } from "./ratingType";

export default function GuideReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadReviews = async () => {
      if (!user?.id) return;

      try {
        const fetchedReviews = await fetchReviews(user.id);
        setReviews(fetchedReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user?.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Reviews & Ratings</h2>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : reviews.length > 0 ? (
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li key={review._id} className="p-6 border rounded-xl shadow-md bg-gray-50 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-lg text-gray-800"> User Name : {review.userId?.name || "Anonymous"}</p>
                  <span className="text-yellow-500 text-lg font-bold">⭐ {review.rating} / 5</span>
                </div>
                <p className="text-gray-600">Comments : {review.comments}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}