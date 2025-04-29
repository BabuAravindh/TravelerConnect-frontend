import { Review } from "./ratingType";

export const fetchReviews = async (userId: string): Promise<Review[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    const data = await response.json();
    return data.feedback;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "An unknown error occurred");
  }
};