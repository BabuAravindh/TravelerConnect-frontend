import axios from "axios";
import { Booking } from "./paymentsTypes";

export const bookingService = {
  async getGuideBookings(guideId: string, token: string): Promise<Booking[]> {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/guide/${guideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.bookings || [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to fetch bookings or payments";
      throw new Error(errorMessage);
    }
  },
};