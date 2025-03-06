import { useState } from "react";

const dummyReviews = [
  { rating: 5, review: "Amazing experience! Highly recommend.", author: "John Doe", date: "Feb 12, 2025" },
  { rating: 4, review: "Great service, but room for improvement.", author: "Jane Smith", date: "Feb 10, 2025" },
  { rating: 3, review: "It was okay, could be better.", author: "Emily Johnson", date: "Feb 8, 2025" },
  { rating: 5, review: "Loved it!", author: "Mike Ross", date: "Feb 6, 2025" },
  { rating: 4, review: "Awesome!", author: "Rachel Zane", date: "Feb 4, 2025" },
  { rating: 5, review: "Exceptional tour!", author: "Harvey Specter", date: "Feb 2, 2025" },
];

const REVIEWS_PER_PAGE = 3;

const ReviewList = ({ reviews = dummyReviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const selectedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  return (
    <div className="lg:col-span-2 flex flex-col space-y-6 p-6 max-w-full mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">User Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
      ) : (
        <>
          {selectedReviews.map((r, index) => (
            <div key={index} className="p-5 bg-primary rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-400 text-xl">{'★'.repeat(r.rating)}</span>
                <span className="text-sm text-white">{r.date}</span>
              </div>
              <p className="text-white text-lg font-medium">{r.review}</p>
              <p className="text-sm text-white mt-2">- {r.author}</p>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg shadow ${currentPage === 1 ? "bg-button text-white cursor-not-allowed" : "bg-button hover:bg-opacity-40 text-white"}`}
            >
              Previous
            </button>

            <span className="text-lg text-black">
               {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg shadow ${currentPage === totalPages ? "bg-transparent cursor-not-allowed" : "bg-transparent hover:bg-opacity-40 text-black"}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewList;
