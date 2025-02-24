import { MessageSquare, Calendar, CreditCard, Star, User } from "lucide-react";

const Dashboard = ({ userRole, userId, data }) => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, <span className="capitalize">{userRole}!</span> 🎉
      </h1>

      {/* Profile Section */}
      {data?.profile && (
        <section className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            Profile Information
          </h2>
          <p className="text-gray-600 mt-2">
            <strong>Name:</strong> {data.profile.name}
          </p>
          <p className="text-gray-600">
            <strong>Email:</strong> {data.profile.email}
          </p>
        </section>
      )}

      {/* Messages Section */}
      <section className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Messages
        </h2>
        {data?.messages?.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.messages.map((msg) => (
              <li key={msg.id} className="p-3 bg-gray-50 rounded-lg shadow-sm border">
                <strong className={msg.sender == userId ? "text-blue-600" : "text-gray-700"}>
                  {msg.sender == userId ? "You" : `User ${msg.sender}`}:
                </strong>{" "}
                {msg.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No messages available.</p>
        )}
      </section>

      {/* Bookings Section */}
      {data?.myBookings?.length > 0 && (
        <section className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Your Bookings
          </h2>
          <ul className="mt-3 space-y-2">
            {data.myBookings.map((booking) => (
              <li key={booking.id} className="p-3 bg-gray-50 rounded-lg shadow-sm border">
                Booking <strong>#{booking.id}</strong> with Guide{" "}
                <strong className="text-green-600">#{booking.guide}</strong> -{" "}
                <span className="text-gray-600">{booking.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payments Section */}
      {data?.myPayments?.length > 0 && (
        <section className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            Your Payments
          </h2>
          <ul className="mt-3 space-y-2">
            {data.myPayments.map((payment) => (
              <li key={payment.id} className="p-3 bg-gray-50 rounded-lg shadow-sm border">
                Payment <strong>#{payment.id}</strong> - <span className="text-gray-600">{payment.amount}</span> -{" "}
                <span className="text-gray-600">{payment.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ratings Section */}
      {data?.ratings?.length > 0 && (
        <section className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Your Ratings
          </h2>
          <ul className="mt-3 space-y-2">
            {data.ratings.map((rating) => (
              <li key={rating.id} className="p-3 bg-gray-50 rounded-lg shadow-sm border">
                ⭐ {rating.rating} / 5
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
