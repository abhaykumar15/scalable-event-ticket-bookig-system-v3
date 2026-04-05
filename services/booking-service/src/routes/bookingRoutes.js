const express = require("express");

const {
  createBooking,
  getBookingById,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBooking);
router.get("/bookings/:bookingId", getBookingById);

module.exports = router;
