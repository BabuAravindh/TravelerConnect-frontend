export interface ModeOfPayment {
    type: string;
    details: Record<string, any>;
    createdAt: string;
  }
  
  export interface Payment {
    amount: number;
    status: "completed" | "pending" | "failed" | "refunded";
    type: "installment" | "deposit" | "full";
    transactionId: string;
    createdAt: string;
    modeOfPayment: ModeOfPayment;
  }
  
  export interface Refund {
    amount: number;
    status: string;
    createdAt: string;
    proof?: string;
    adminComment?: string;
  }
  
  export interface BookingPaymentData {
    userName: string;
    userEmail: string;
    dateRange: string;
    budget: number;
    totalPaid: number;
    remainingBalance: number;
    paymentStatus: "partial" | "paid" | "unpaid";
    status: "pending" | "confirmed" | "cancelled";
    payments: Payment[];
    refunds: Refund[];
  }
  
  export interface PaymentDetails {
    payment: Payment;
    booking: {
      userName: string;
      userEmail: string;
      dateRange: string;
      budget: number;
      totalPaid: number;
      remainingBalance: number;
      paymentStatus: string;
      status: string;
    };
    modeOfPayment: ModeOfPayment;
    refund?: Refund;
  }