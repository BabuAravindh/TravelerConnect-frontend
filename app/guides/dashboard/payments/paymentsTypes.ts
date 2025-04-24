export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  }
  
  export interface Payment {
    paymentId: string;
    amount: number;
    date: string;
    status: string;
    type: string;
    method: string;
    proofUrl: string | null;
    transactionId: string;
    notes?: string;
    transactionDetails?: {
      screenshotUrl?: string;
    };
  }
  
  export interface Booking {
    bookingId: string;
    bookingDate: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    tourDates: {
      start: string;
      end: string;
    };
    budget: number;
    status: string;
    paymentStatus: string;
    totalPaid: number;
    remainingBalance: number;
    activities?: string[];
    customer: Customer;
    razorpayOrderId?: string;
    payments: Payment[];
  }