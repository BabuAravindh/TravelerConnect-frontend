import axios, { AxiosError } from "axios";
import { Booking, PaymentHistory } from "../../types/user/bookings";

const BASE_URL = "http://localhost:5000";

export const initiatePayment = async (
  bookingId: string,
  amount: number,
  token: string,
  paymentType: string = "installment"
): Promise<{ order: any }> => {
  if (!bookingId || !amount || amount < 1) {
    throw new Error("Invalid payment details");
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/payment/initiate`,
      { bookingId, amount, paymentType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      (err.response?.data as { message?: string })?.message || "Payment failed"
    );
  }
};

export const verifyPayment = async (
  paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    bookingId: string;
    amount: number;
  },
  token: string
): Promise<{ payment: PaymentHistory; booking: Booking }> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payment/verify`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { payment, booking } = response.data;
    return {
      payment: {
        id: payment?._id || `new-payment-${Date.now()}`,
        amount: payment?.amount || 0,
        paymentType: payment?.paymentType || "installment",
        status: payment?.paymentStatus || "completed",
        method: "razorpay",
        date: payment?.completedAt ? new Date(payment.completedAt) : new Date(),
        installmentNumber: payment?.installmentNumber || 0,
        receiptId: payment?.payId || "",
      },
      booking: {
        ...booking,
        id: paymentData.bookingId,
        totalPaid: booking?.totalPaid || 0,
        remainingBalance: booking?.remainingBalance || 0,
        paymentStatus: booking?.paymentStatus || "partial",
      },
    };
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      (err.response?.data as { message?: string })?.message ||
        "Payment verification failed"
    );
  }
};

export const recordManualPayment = async (
  bookingId: string,
  amount: number,
  method: string,
  screenshot: File | null,
  token: string
): Promise<{ bookingStatus: Booking; message: string }> => {
  try {
    if (!amount || amount < 1) {
      throw new Error("Invalid amount");
    }

    const formData = new FormData();
    formData.append("bookingId", bookingId);
    formData.append("amount", amount.toString());
    formData.append("paymentMethod", method);
    formData.append("notes", `${method} payment recorded`);
    if (method === "bank_transfer") {
      formData.append("bankName", "Customer Bank");
      formData.append("accountLast4", "1234");
    }
    if (screenshot) {
      formData.append("screenshot", screenshot);
      (`Uploading screenshot for booking ${bookingId}, Size: ${(screenshot.size / 1024 / 1024).toFixed(2)} MB`);
    }

    const response = await axios.post(`${BASE_URL}/api/payment/cash`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 180000, // 180 seconds to match backend Cloudinary timeout
    });

    const { bookingStatus, message } = response.data;
    return {
      bookingStatus: {
        ...bookingStatus,
        id: bookingId,
        totalPaid: bookingStatus.totalPaid || 0,
        remainingBalance: bookingStatus.remainingBalance || 0,
        paymentStatus: bookingStatus.paymentStatus || "partial",
      },
      message,
    };
  } catch (error) {
    const err = error as AxiosError;
    if (
      err.code === "ECONNABORTED" ||
      err.message.includes("timeout") ||
      err.message.includes("Request Timeout")
    ) {
      throw new Error(
        "Request timed out while uploading screenshot to server. Try a smaller file or check your network."
      );
    }
    throw new Error(
      (err.response?.data as { message?: string })?.message ||
        "Failed to record payment"
    );
  }
};