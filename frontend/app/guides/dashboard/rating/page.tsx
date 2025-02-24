import GuideDashboard from "../page";

export default function GuideReviews() {
    const reviews = [
      {
        _id: "1",
        userId: { name: "John Doe" },
        rating: 5,
        review: "Amazing guide! Very knowledgeable and friendly.",
      },
      {
        _id: "2",
        userId: { name: "Sarah Smith" },
        rating: 4,
        review: "Had a great experience. Could improve time management.",
      },
      {
        _id: "3",
        userId: { name: "Michael Brown" },
        rating: 3,
        review: "Good but expected more historical insights.",
      },
    ];
  
    return (
        <GuideDashboard>
      <div classNameName="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 classNameName="text-2xl font-bold text-gray-800 mb-4">Reviews & Ratings</h2>
        {reviews.length > 0 ? (
          <ul classNameName="space-y-4">
            {reviews.map((review) => (
              <li key={review._id} classNameName="p-4 border rounded-lg shadow-md bg-gray-50">
                <p classNameName="font-semibold text-lg text-gray-800">{review.userId.name}</p>
                <p classNameName="text-yellow-500 text-lg">⭐ {review.rating} / 5</p>
                <p classNameName="text-gray-600">{review.review}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p classNameName="text-gray-500 text-center">No reviews yet.</p>
        )}
      </div>
      </GuideDashboard>
    );
    
  }
  