const Booking = require("../models/Booking");
const { publishEvent } = require("../config/rabbit");
const { redisClient } = require("../config/redis");

const buildSeatLockKey = (showId, seatNumber) =>
  `lock:show:${showId}:seat:${seatNumber}`;

exports.createBooking = async (req, res) => {
  try {
    const userId    = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];
    const userRole  = req.headers["x-user-role"];
    const { movieId, movieTitle, showId, showStartTime, amount } = req.body;
    const seatNumbers = req.body.seatNumbers || req.body.seats;

    if (!userId || !userEmail) {
      return res.status(401).json({ message: "User context missing." });
    }

    if (
      !movieId || !movieTitle || !showId || !showStartTime || !amount ||
      !Array.isArray(seatNumbers) || seatNumbers.length === 0
    ) {
      return res.status(400).json({ message: "Incomplete booking payload." });
    }

    const conflictingBooking = await Booking.findOne({
      showId,
      status: { $in: ["PENDING_PAYMENT", "PAYMENT_SUCCESS"] },
      seatNumbers: { $in: seatNumbers },
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: "One or more seats have already been booked." });
    }

    for (const seatNumber of seatNumbers) {
      const lockValue = await redisClient.get(buildSeatLockKey(showId, seatNumber));

      if (!lockValue) {
        return res.status(409).json({ message: `Seat ${seatNumber} lock expired.` });
      }

      const parsedLock = JSON.parse(lockValue);

      if (parsedLock.userId !== userId) {
        return res.status(409).json({ message: `Seat ${seatNumber} is locked by another user.` });
      }
    }

    const booking = await Booking.create({
      userId, userEmail, movieId, movieTitle, showId,
      showStartTime, seatNumbers,
      amount: Number(amount),
      status: "PENDING_PAYMENT",
    });

    await publishEvent("booking.created", {
      event: "booking.created",
      data: {
        bookingId: booking._id.toString(),
        userId, userEmail, userRole,
        movieId, movieTitle, showId, showStartTime, seatNumbers,
        amount: Number(amount),
      },
      meta: { attempt: 0 },
      createdAt: new Date().toISOString(),
    });

    await redisClient.del(
      ...seatNumbers.map((seatNumber) => buildSeatLockKey(showId, seatNumber))
    );

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create booking.", error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const requesterId   = req.headers["x-user-id"];
    const requesterRole = req.headers["x-user-role"];

    if (requesterRole !== "admin" && booking.userId !== requesterId) {
      return res.status(403).json({ message: "You do not have access to this booking." });
    }

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch booking.", error: error.message });
  }
};

exports.getBookingHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const requesterId   = req.headers["x-user-id"];
    const requesterRole = req.headers["x-user-role"];

    if (requesterRole !== "admin" && requesterId !== userId) {
      return res.status(403).json({
        message: "You do not have permission to view this user's booking history.",
      });
    }

    const page    = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit   = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip    = (page - 1) * limit;
    const sortDir = req.query.sort === "asc" ? 1 : -1;

    const filter = { userId };
    if (req.query.status) {
      const allowed = ["PENDING_PAYMENT", "PAYMENT_SUCCESS", "PAYMENT_FAILED"];
      if (!allowed.includes(req.query.status)) {
        return res.status(400).json({
          message: `Invalid status filter. Allowed values: ${allowed.join(", ")}`,
        });
      }
      filter.status = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return res.json({
      userId,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch booking history.",
      error: error.message,
    });
  }
};
