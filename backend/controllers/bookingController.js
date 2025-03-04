const Booking = require("../models/Booking");
const User = require('../models/User')
// ✅ Fetch all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).populate("guideId", "name profileImage"); // Populate guide name & image

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Fetch booking details by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("guideId", "name profileImage");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Create a new booking
exports.createBooking = async (req, res) => {
  console.log(req.body)
  try {
    const { userId, guideId,guideImage,guideName, tripDate, duration, places, price,bookindDate,status,order } = req.body;

    // Fetch guide details (Name & Image) from User model
    const guide = await User.findById(guideId);
    if (!guide) return res.status(404).json({ message: "Guide not found" });

    const newBooking = new Booking({
      userId,
      guideId,
      guideName,
      guideImage,
      bookindDate,
      tripDate,
      duration,
      places,
      order,
      status,
      price,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // "Completed" or "Cancelled"

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
