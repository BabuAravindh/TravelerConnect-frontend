import { BookingPaymentData, PaymentDetails } from "./paymentTypes";

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<{ success: boolean; data: unknown; message?: string }> => {
  // Read the response body once as text
  const bodyText = await response.text();

  // Try to parse the body as JSON if possible
  let jsonBody;
  try {
    jsonBody = JSON.parse(bodyText);
  } catch {
    // If parsing fails, use the raw text as the error message
    jsonBody = null;
  }

  if (!response.ok) {
    if (response.status === 404) {
      return { success: false, data: null, message: "Resource not found" };
    }
    const errorMessage = jsonBody?.message || bodyText || "Unknown error";
    throw { status: response.status, message: `HTTP error! status: ${response.status} - ${errorMessage}` };
  }

  // If response is OK, return the parsed JSON if available, or parse the text as JSON
  return jsonBody || JSON.parse(bodyText);
};

// Fetch all booking payments for a user
export const fetchBookingPayments = async (userId: string): Promise<BookingPaymentData[]> => {
  if (!userId) {
    throw { message: "User ID is required" };
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/payment/booking/${userId}`;
    const response = await fetch(url);
    const { success, data, message } = await handleApiError(response);

    if (!success) {
      throw { message: message || "Failed to load payment data" };
    }

    return Array.isArray(data) ? (data as BookingPaymentData[]) : [];
  } catch (err: unknown) {
    console.error("Payment fetch error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    const status = err instanceof Object && "status" in err ? Number(err.status) : null;
    throw { message: status === 500 ? "Server error occurred. Please try again later." : errorMessage, status };
  }
};

// Fetch payment details by transaction ID
export const fetchPaymentDetails = async (transactionId: string): Promise<PaymentDetails> => {
  if (!transactionId) {
    throw { message: "Transaction ID is required" };
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/payments/transaction/${transactionId}`;
    const response = await fetch(url);
    const { success, data, message } = await handleApiError(response);

    if (!success) {
      throw { message: message || "Failed to load payment details" };
    }

    return data as PaymentDetails;
  } catch (err: unknown) {
    console.error("Payment details fetch error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    const status = err instanceof Object && "status" in err ? Number(err.status) : null;
    throw { message: status === 500 ? "Server error occurred. Please try again later." : errorMessage, status };
  }
};