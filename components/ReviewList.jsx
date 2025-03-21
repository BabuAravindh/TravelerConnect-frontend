"use client";
import { useState, useEffect } from "react";

const REVIEWS_PER_PAGE = 1; // Set 1 for testing pagination

const ReviewList = ({ guideId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!guideId) return;

      try {
        setLoading(true);
        setError(null); // Reset error state on each request

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${guideId}?page=${currentPage}&limit=${REVIEWS_PER_PAGE}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }

        const data = await response.json();

        setReviews(data.feedback || []);
        setTotalPages(data.totalPage || 1); // Fix: Ensure correct API field name
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }; console.log("Fetching reviews for page:", currentPage);
    fetchReviews();

 
  }, [guideId, currentPage]);


  
  return (
    <div className="lg:col-span-2 flex flex-col space-y-6 p-6 max-w-full mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">User Reviews</h3>

      {loading ? (
        <p className="text-center text-gray-500">Loading reviews...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
      ) : (
        <>
          {reviews.map((r) => (
            <div key={r._id} className="p-5 bg-primary rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-400 text-xl">{'★'.repeat(r.rating)}</span>
                <span className="text-sm text-white">{new Date(r.submittedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-white text-lg font-medium">{r.comments}</p>
              <p className="text-sm text-white mt-2">- {r.userId?.name || "Anonymous"}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
  onClick={() => {
    setCurrentPage((prev) => {
      console.log("Previous clicked. New page:", Math.max(prev - 1, 1));
      return Math.max(prev - 1, 1);
    });
  }}
  disabled={currentPage === 1}
  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
>
  Previous
</button>

<button
  onClick={() => {
    setCurrentPage((prev) => {
      console.log("Next clicked. New page:", Math.min(prev + 1, totalPages));
      return Math.min(prev + 1, totalPages);
    });
  }}
  disabled={currentPage === totalPages}
  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
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
