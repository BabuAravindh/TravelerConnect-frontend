import axios, { AxiosError } from "axios";
import { Booking, PaymentHistory } from "../../types/user/bookings";

const BASE_URL = "http://localhost:5000";

export const fetchUserBookings = async (
  userId: string,
  token: string
): Promise<Booking[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bookings/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data?.map((booking: any) => ({
      id: booking?._id || `fallback-${Date.now()}-${Math.random()}`,
      guideName: booking?.guideProfile?.guideName || "Unknown Guide",
      guideLanguages: booking?.guideProfile?.languages?.join(", ") || "Not specified",
      startDate: booking?.startDate
        ? new Date(booking.startDate).toLocaleDateString()
        : "N/A",
      endDate: booking?.endDate
        ? new Date(booking.endDate).toLocaleDateString()
        : "N/A",
      budget: booking?.budget || 0,
      status: booking?.status || "unknown",
      paymentStatus: booking?.paymentStatus || "pending",
      totalPaid: booking?.totalPaid || 0,
      remainingBalance: booking?.remainingBalance || booking?.budget || 0,
      activities: booking?.activities || [],
      duration:
        booking?.startDate && booking?.endDate
          ? `${Math.ceil(
              (new Date(booking.endDate).getTime() -
                new Date(booking.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )} days`
          : "N/A",
      guideEmail: booking?.guideProfile?.guideEmail || "",
      guidePhoneNumber: booking?.guideProfile?.guidePhoneNumber || "",
    })) || [];
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      (err.response?.data as { message?: string })?.message ||
        "Failed to fetch bookings"
    );
  }
};

export const fetchPaymentHistory = async (
  bookingId: string,
  token: string
): Promise<PaymentHistory[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payment/history/${bookingId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return (
      response.data?.payments?.map((payment: any) => ({
        id: payment?._id || `fallback-payment-${Date.now()}-${Math.random()}`,
        amount: payment?.amount || 0,
        paymentType: payment.type || "unknown",
        status: payment.status || "unknown",
        method: payment.method || "unknown",
        date: payment?.completedAt ? new Date(payment.completedAt) : new Date(),
        installmentNumber: payment.installmentNumber || 0,
        receiptId: payment?.payId || "",
        screenshotUrl: payment?.transactionDetails?.screenshotUrl || undefined,
      })) || []
    );
  } catch (error) {
    console.error(`Failed to fetch payments for booking ${bookingId}:`, error);
    return [];
  }
};