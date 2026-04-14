const express = require("express");
const {
  createBooking, getBookingById,
  getUserBookings, getAdminBookings,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings",          createBooking);
router.get("/bookings",           getUserBookings);
router.get("/bookings/admin/all", getAdminBookings); // admin only
router.get("/bookings/:bookingId", getBookingById);

module.exports = router;