import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");

  const mockData = {
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    ],
    guides: [
      { id: 3, name: "Guide A", email: "guideA@example.com", role: "guide" },
      { id: 4, name: "Guide B", email: "guideB@example.com", role: "guide" },
    ],
    bookings: [
      { id: 5, user: 1, guide: 3, status: "Confirmed" },
      { id: 6, user: 2, guide: 4, status: "Pending" },
    ],
    payments: [
      { id: 7, user: 1, amount: "$100", status: "Paid" },
      { id: 8, user: 2, amount: "$150", status: "Pending" },
    ],
    ratings: [
      { id: 9, guide: 3, rating: 5 },
      { id: 10, guide: 4, rating: 4 },
    ],
    messages: [
      { id: 11, sender: 1, receiver: 3, text: "Hello Guide A!" },
      { id: 12, sender: 3, receiver: 1, text: "Hello User 1!" },
      { id: 13, sender: 2, receiver: 4, text: "Hey Guide B!" },
    ],
  };

  let filteredData = { profile: {} };

  if (role === "admin") {
    filteredData = mockData; // Admin gets everything
  } else if (role === "guide") {
    filteredData = {
      profile: mockData.guides.find((g) => g.id == userId),
      assignedBookings: mockData.bookings.filter((b) => b.guide == userId),
      ratings: mockData.ratings.filter((r) => r.guide == userId),
      messages: mockData.messages.filter((m) => m.sender == userId || m.receiver == userId),
    };
  } else if (role === "user") {
    filteredData = {
      profile: mockData.users.find((u) => u.id == userId),
      myBookings: mockData.bookings.filter((b) => b.user == userId),
      myPayments: mockData.payments.filter((p) => p.user == userId),
      messages: mockData.messages.filter((m) => m.sender == userId || m.receiver == userId),
    };
  }

  return NextResponse.json(filteredData);
}
