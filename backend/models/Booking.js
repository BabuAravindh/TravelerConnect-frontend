const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guideName: { type: String, required: true }, // ✅ Store guide's name
  guideImage: { type: String, required: true }, // ✅ Store guide's image URL
  bookingDate: { type: Date, required: true, default: Date.now },
  tripDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // ✅ Store trip duration (days)
  places: { type: [String], required: true }, // ✅ Store places in array format
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["booked", "cancelled", "pending"],
    default: "pending",
  },
  order: { type: Number, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema);
