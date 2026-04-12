const express = require("express");

const {
  createBooking,
  getBookingById,
  getUserBookings,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBooking);
router.get("/bookings", getUserBookings);
router.get("/bookings/:bookingId", getBookingById);

module.exports = router;
