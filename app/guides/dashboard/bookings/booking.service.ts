import { Booking, Payment, PaymentHistoryResponse } from './bookingTypes';

export const bookingService = {
  async getBookings(guideId: string, token: string): Promise<Booking[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/guide/${guideId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(
        response.status === 404 ? 'No bookings found' : 'Failed to fetch bookings'
      );
    }

    const data = await response.json();
    const bookingsArray = Array.isArray(data) ? data : data.bookings || [data];

    // Validate and filter bookings
    return bookingsArray.filter((booking: Booking) => {
      const isValid = booking.id && Number.isFinite(booking.budget);
      if (!isValid) {
        console.warn('Invalid booking filtered out:', booking);
      }
      return isValid;
    });
  },

  async getPaymentHistory(bookingId: string, token: string): Promise<PaymentHistoryResponse | null> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payment/history/${bookingId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      console.warn(`Payment history not found for booking ${bookingId}: Status ${response.status}`);
      return null;
    }

    return await response.json();
  },

  async updateBookingStatus(bookingId: string, token: string): Promise<void> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update booking status');
    }
  },

  async updatePaymentStatus(paymentId: string, token: string): Promise<Payment> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payment/${paymentId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: 'completed' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update payment status');
    }

    return await response.json();
  },
};