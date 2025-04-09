import { Home, Calendar, MessageSquare, CreditCard, Users, ClipboardList, Star, User, Book, Info } from "lucide-react";





export const users = {
    user1: { id: "user1", name: "John Doe", password: "hashed_password", status: true, userType: "customer" },
    user2: { id: "user2", name: "Jane Smith", password: "hashed_password", status: true, userType: "guide" },
  };
  
  export const userProfiles = {
    profile1: {
      _id: "profile1",
      userId: "user1",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+123456789",
      dateOfBirth: "1990-01-01",
      profilePicture: "https://example.com/johndoe.jpg",
      address: {
        street: "123 Main St",
        city: "New York",
        stateId: "state1",
        countryId: "country1",
        
        postalCode: 10001,
      },
      dateJoined: "2023-01-01",
      lastLogin: "2024-01-10",
      gender: "male",
      order: 1,
    },
  };
  
  export const languages = {
    lang1: { _id: "lang1", languageName: "English", createdAt: "2023-01-01", updatedAt: "2024-01-01", languageStatus: "active", order: 1 },
  };
  
  export const countries = {
    country1: { _id: "country1", countryName: "United States", createdAt: "2023-01-01", order: 1 },
  };
  
  export const states = {
    state1: { _id: "state1", stateName: "New York", createdAt: "2023-01-01", order: 1 },
  };
  
  export const guideLanguages = {
    guideLang1: { _id: "guideLang1", userId: "user2", spokenLanguage: "English" },
  };
  
  export const requests = {
    req1: {
      _id: "req1",
      customerId: "user1",
      guideId: "user2",
      status: "pending",
      requestedAt: "2024-01-05",
      paymentStatus: "pending",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-06",
      order: 1,
    },
  };
  
  export const conversations = {
    conv1: {
      _id: "conv1",
      userOneId: "user1",
      userTwoId: "user2",
      startedAt: "2024-01-10",
      lastMessageTime: "2024-01-11",
      requestId: "req1",
      order: 1,
    },
  };
  
  export const messages = {
    msg1: {
      _id: "msg1",
      conversionId: "conv1",
      senderId: "user1",
      message: "Hello, I need a guide for my trip.",
      messageType: "text",
      timestamp: "2024-01-10T10:00:00Z",
      status: "sent",
    },
  };
  
  export const chatAttachments = {
    attach1: {
      _id: "attach1",
      messageId: "msg1",
      fileUrl: "https://example.com/document.pdf",
      fileType: "pdf",
      fileSize: 1024,
      uploadedAt: "2024-01-10T10:05:00Z",
    },
  };
  
  export const userPresence = {
    presence1: { _id: "presence1", userId: "user1", status: "online", lastSeen: "2024-01-11T12:00:00Z" },
  };
  
  export const feedback = {
    feedback1: {
      _id: "feedback1",
      customerId: "user1",
      guideId: "user2",
      rating: 5,
      comments: "Great experience!",
      submittedAt: "2024-01-11",
      status: "submitted",
    },
  };
  
  export const aiIntegrations = {
    ai1: {
      _id: "ai1",
      userId: "user1",
      query: "Find me the best travel guide.",
      response: "Here are some recommendations...",
      responseStatus: "success",
      createdAt: "2024-01-10",
    },
  };
  
  export const creditHistory = {
    credit1: {
      _id: "credit1",
      userId: "user1",
      creditBefore: 100,
      creditsUsed: 10,
      creditsAfter: 90,
      interactionId: "ai1",
    },
  };
  
  export const activities = {
    activity1: { _id: "activity1", activityName: "Hiking", order: 1 },
  };
  
  export const guideAvailability = {
    avail1: {
      _id: "avail1",
      guideId: "user2",
      availableDay: 5, // Friday
      isBooked: false,
      createdAt: "2024-01-01",
      order: 1,
    },
  };
  
  export const bookings = {
    book1: {
      _id: "book1",
      userId: "user1",
      guideId: "user2",
      bookingDate: "2024-01-15",
      tripDate: "2024-02-01",
      price: 200,
      status: "booked",
      order: 1,
    },
  };
  
  export const modeOfPayment = {
    paymentMode1: {
      _id: "paymentMode1",
      modeOfPayment: "Credit Card",
      bookingId: "book1",
      createdAt: "2024-01-15",
      order: 1,
    },
  };
  
  export const payments = {
    payment1: {
      _id: "payment1",
      modeOfPaymentId: "paymentMode1",
      amount: 200,
      paymentStatus: "completed",
      updatedAt: "2024-01-15",
      customerRequest: "Payment for guide booking",
      customerResponse: "Payment successful",
      order: 1,
      completedAt: "2024-01-15",
      failedAt: null,
      refundedAt: null,
    },
  };
  
  export const refunds = {
    refund1: {
      _id: "refund1",
      paymentId: "payment1",
      amountRefunded: 0,
      status: "pending",
      createdAt: "2024-01-15",
      refundedAt: null,
    },
  };










  // prefinded routes
export const roleBasedNavItems: Record<string, { href: string; label: string; icon: any }[]> = {
  user: [
    { href: "/user/dashboard/", label: "Home", icon: Home },
    { href: "/user/dashboard/bookings", label: "Bookings", icon: Calendar },
    { href: "/user/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/user/dashboard/payments", label: "Payments", icon: CreditCard },
  ],
  guide: [
    { href: "/guides/dashboard/", label: "Home", icon: Home },
    { href: "/guides/dashboard/bookings", label: "Assigned Bookings", icon: ClipboardList },
    { href: "/guides/dashboard/attractionListing", label: "attraction Listing", icon: ClipboardList },
    { href: "/guides/dashboard/destinationRoutes", label: "destination routes", icon: ClipboardList },
    { href: "/guides/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/guides/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/guides/dashboard/rating", label: "Ratings", icon: Star },
    { href: "/guides/dashboard/requests", label: "Requests", icon: Star },
    { href: "/guides/dashboard/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/admin/", label: "Home", icon: Home },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/request", label: "requests Guide", icon: Users },
    { href: "/admin/messages", label: "Manage Messages", icon: Users },
    { href: "/admin/bookings", label: "All Bookings", icon: Calendar },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/information", label: " Website Content", icon: Info },
    { href: "/admin/customerSupport", label: "Customer Report", icon: Info },
    { href: "/admin/ratings", label: "Ratings", icon: Star },
  ],
};


//admin dummy data
export const dashboardData = {
  totalUsers: 1200,
  activeUsers: 850,
  totalGuides: 250,
  totalBookings: 3400,
  pendingBookings: 120,
  totalPayments: 95000,
  avgRating: 4.7,
  revenueGrowth: 12.5, // Percentage growth
};

export const recentActivities = [
  { user: "John Doe", action: "Booked a tour to Italy", time: "5 min ago" },
  { user: "Alice Smith", action: "Left a 5-star review for Guide Alex", time: "20 min ago" },
  { user: "Mark Lee", action: "Cancelled a booking", time: "1 hour ago" },
];

export const topGuides = [
  { name: "Alex Johnson", rating: 4.9, tours: 150 },
  { name: "Samantha Lee", rating: 4.8, tours: 130 },
  { name: "Michael Brown", rating: 4.7, tours: 120 },
];

