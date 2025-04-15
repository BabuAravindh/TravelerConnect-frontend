export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
  
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  export const openRazorpayCheckout = (
    order: any,
    bookingId: string,
    amount: number,
    user: { name?: string; email?: string; phone?: string },
    onSuccess: (response: any) => void
  ) => {
    const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
    const options = {
      key: RAZORPAY_KEY,
      amount: amount * 100,
      currency: "INR",
      order_id: order.id,
      name: "Tour Guide Booking",
      description: `Payment for booking ${bookingId}`,
      handler: onSuccess,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone?.replace(/\D/g, "").slice(-10) || "",
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: () => console.log("Checkout form closed"),
        escape: false,
      },
    };
  
    console.log("➡️ Razorpay prefill:", options.prefill);
    new window.Razorpay(options).open();
  };