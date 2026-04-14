const Booking = require("../models/Booking");
const { publishEvent } = require("../config/rabbit");
const { redisClient } = require("../config/redis");

const buildSeatLockKey = (showId, seatNumber) => `lock:show:${showId}:seat:${seatNumber}`;

exports.createBooking = async (req, res) => {
  try {
    const userId    = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];
    const userRole  = req.headers["x-user-role"];
    const { movieId, movieTitle, showId, showStartTime, amount } = req.body;
    const seatNumbers = req.body.seatNumbers || req.body.seats;

    if (!userId || !userEmail)
      return res.status(401).json({ message: "User context missing." });
    if (!movieId || !movieTitle || !showId || !showStartTime || !amount || !Array.isArray(seatNumbers) || seatNumbers.length === 0)
      return res.status(400).json({ message: "Incomplete booking payload." });

    const conflictingBooking = await Booking.findOne({
      showId,
      status: { $in: ["PENDING_PAYMENT", "PAYMENT_SUCCESS"] },
      seatNumbers: { $in: seatNumbers },
    });
    if (conflictingBooking)
      return res.status(409).json({ message: "One or more seats have already been booked." });

    const duplicateUserBooking = await Booking.findOne({
      userId, showId,
      status: { $in: ["PENDING_PAYMENT", "PAYMENT_SUCCESS"] },
    });
    if (duplicateUserBooking)
      return res.status(409).json({ message: "You already have a booking for this show." });

    for (const seatNumber of seatNumbers) {
      const lockValue = await redisClient.get(buildSeatLockKey(showId, seatNumber));
      if (!lockValue)
        return res.status(409).json({ message: `Seat ${seatNumber} lock expired.` });
      const parsedLock = JSON.parse(lockValue);
      if (parsedLock.userId !== userId)
        return res.status(409).json({ message: `Seat ${seatNumber} is locked by another user.` });
    }

    const booking = await Booking.create({
      userId, userEmail, movieId, movieTitle,
      showId, showStartTime, seatNumbers,
      amount: Number(amount), status: "PENDING_PAYMENT",
    });

    await publishEvent("booking.created", {
      event: "booking.created",
      data: {
        bookingId: booking._id.toString(),
        userId, userEmail, userRole, movieId, movieTitle,
        showId, showStartTime, seatNumbers, amount: Number(amount),
      },
      meta: { attempt: 0 },
      createdAt: new Date().toISOString(),
    });

    await redisClient.del(...seatNumbers.map((s) => buildSeatLockKey(showId, s)));
    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create booking.", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "User context missing." });
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch bookings.", error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    const requesterId   = req.headers["x-user-id"];
    const requesterRole = req.headers["x-user-role"];
    if (requesterRole !== "admin" && booking.userId !== requesterId)
      return res.status(403).json({ message: "You do not have access to this booking." });
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch booking.", error: error.message });
  }
};

// Admin only — get all bookings with optional period filter
exports.getAdminBookings = async (req, res) => {
  try {
    if (req.headers["x-user-role"] !== "admin")
      return res.status(403).json({ message: "Admin access required." });

    const { period, status, page = 1, limit = 50 } = req.query;

    // Build date filter based on period
    const now = new Date();
    let fromDate = null;

    if (period === "hour")  fromDate = new Date(now - 1000 * 60 * 60);
    if (period === "day")   fromDate = new Date(now - 1000 * 60 * 60 * 24);
    if (period === "week")  fromDate = new Date(now - 1000 * 60 * 60 * 24 * 7);
    if (period === "month") fromDate = new Date(now - 1000 * 60 * 60 * 24 * 30);

    const filter = {};
    if (fromDate) filter.createdAt = { $gte: fromDate };
    if (status)   filter.status    = status;

    const total    = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Summary stats for the period
    const allInPeriod = await Booking.find(filter);
    const totalRevenue  = allInPeriod.filter((b) => b.status === "PAYMENT_SUCCESS").reduce((sum, b) => sum + b.amount, 0);
    const successCount  = allInPeriod.filter((b) => b.status === "PAYMENT_SUCCESS").length;
    const pendingCount  = allInPeriod.filter((b) => b.status === "PENDING_PAYMENT").length;
    const failedCount   = allInPeriod.filter((b) => b.status === "PAYMENT_FAILED").length;

    return res.json({
      bookings,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      stats: { totalRevenue, successCount, pendingCount, failedCount, totalBookings: total },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch bookings.", error: error.message });
  }
};