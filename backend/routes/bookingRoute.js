const express = require("express");
const {
  createBooking,
  getUserBookings, // Fetch all bookings for a user
  getBookingById, // Fetch details of a specific booking
  updateBookingStatus, // Update status (e.g., cancel, complete)
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking); // Create a new booking
router.get("/user/:userId", getUserBookings); // Get all bookings of a user (listing)
router.get("/detail/:bookingId", getBookingById); // Get booking details by ID
router.put("/:bookingId", updateBookingStatus); // Update booking status

module.exports = router;
