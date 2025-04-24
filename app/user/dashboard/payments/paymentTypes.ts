export interface ModeOfPayment {
  type: string;
  details?: Record<string, string>;
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
  paymentStatus: string;
  status: string;
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
    status: string;
  };
  modeOfPayment: ModeOfPayment;
  refund?: Refund;
}

export interface PaymentWithInstallment extends Payment {
  installmentNumber?: number;
}