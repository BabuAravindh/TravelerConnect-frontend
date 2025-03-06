import { NextResponse } from "next/server";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user";
}

interface Guide {
  id: number;
  name: string;
  email: string;
  role: "guide";
}

interface Booking {
  id: number;
  user: number;
  guide: number;
  status: string;
}

interface Payment {
  id: number;
  user: number;
  amount: string;
  status: string;
}

interface Rating {
  id: number;
  guide: number;
  rating: number;
}

interface Message {
  id: number;
  sender: number;
  receiver: number;
  text: string;
}

interface DashboardData {
  profile: User | Guide | null;
  users?: User[];
  guides?: Guide[];
  bookings?: Booking[];
  payments?: Payment[];
  ratings?: Rating[];
  messages?: Message[];
  assignedBookings?: Booking[];
  myBookings?: Booking[];
  myPayments?: Payment[];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");

  const mockData = {
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    ] as User[],
    guides: [
      { id: 3, name: "Guide A", email: "guideA@example.com", role: "guide" },
      { id: 4, name: "Guide B", email: "guideB@example.com", role: "guide" },
    ] as Guide[],
    bookings: [
      { id: 5, user: 1, guide: 3, status: "Confirmed" },
      { id: 6, user: 2, guide: 4, status: "Pending" },
    ] as Booking[],
    payments: [
      { id: 7, user: 1, amount: "$100", status: "Paid" },
      { id: 8, user: 2, amount: "$150", status: "Pending" },
    ] as Payment[],
    ratings: [
      { id: 9, guide: 3, rating: 5 },
      { id: 10, guide: 4, rating: 4 },
    ] as Rating[],
    messages: [
      { id: 11, sender: 1, receiver: 3, text: "Hello Guide A!" },
      { id: 12, sender: 3, receiver: 1, text: "Hello User 1!" },
      { id: 13, sender: 2, receiver: 4, text: "Hey Guide B!" },
    ] as Message[],
  };

  let filteredData: DashboardData = { profile: null };

  if (role === "admin") {
    filteredData = {
      profile: null,
      ...mockData,
    };
  } else if (role === "guide") {
    filteredData = {
      profile: mockData.guides.find((g) => g.id === Number(userId)) || null,
      assignedBookings: mockData.bookings.filter((b) => b.guide === Number(userId)),
      ratings: mockData.ratings.filter((r) => r.guide === Number(userId)),
      messages: mockData.messages.filter((m) => m.sender === Number(userId) || m.receiver === Number(userId)),
    };
  } else if (role === "user") {
    filteredData = {
      profile: mockData.users.find((u) => u.id === Number(userId)) || null,
      myBookings: mockData.bookings.filter((b) => b.user === Number(userId)),
      myPayments: mockData.payments.filter((p) => p.user === Number(userId)),
      messages: mockData.messages.filter((m) => m.sender === Number(userId) || m.receiver === Number(userId)),
    };
  }

  return NextResponse.json(filteredData);
}
