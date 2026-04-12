const express = require("express");

const {
  createBooking,
  getBookingById,
  getBookingHistory,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/bookings/history/:userId", getBookingHistory);
router.post("/bookings",            createBooking);
router.get("/bookings/:bookingId",  getBookingById);

module.exports = router;