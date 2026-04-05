const Booking = require("../models/Booking");
const { redisClient } = require("../config/redis");

const buildSeatLockKey = (showId, seatNumber) => `lock:show:${showId}:seat:${seatNumber}`;

exports.getSeatStatus = async (req, res) => {
  try {
    const { showId } = req.params;

    const activeBookings = await Booking.find({
      showId,
      status: { $in: ["PENDING_PAYMENT", "PAYMENT_SUCCESS"] },
    }).select("seatNumbers");

    const bookedSeats = activeBookings.flatMap((booking) => booking.seatNumbers);
    const lockedKeys = await redisClient.keys(buildSeatLockKey(showId, "*"));
    const lockedSeats = lockedKeys.map((key) => key.split(":").pop());

    return res.json({
      showId,
      bookedSeats,
      lockedSeats,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch seat status.", error: error.message });
  }
};

exports.lockSeats = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];
    const { showId } = req.body;
    const seatNumbers = req.body.seatNumbers || req.body.seats;
    const ttlSeconds = Number(process.env.SEAT_LOCK_TTL_SECONDS || 300);

    if (!userId || !showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "showId and seatNumbers are required." });
    }

    const alreadyBooked = await Booking.findOne({
      showId,
      status: { $in: ["PENDING_PAYMENT", "PAYMENT_SUCCESS"] },
      seatNumbers: { $in: seatNumbers },
    });

    if (alreadyBooked) {
      return res.status(409).json({ message: "One or more seats are already booked." });
    }

    const acquiredLocks = [];

    for (const seatNumber of seatNumbers) {
      const lockKey = buildSeatLockKey(showId, seatNumber);
      const lockValue = JSON.stringify({ userId, userEmail });
      const result = await redisClient.set(lockKey, lockValue, "EX", ttlSeconds, "NX");

      if (!result) {
        if (acquiredLocks.length > 0) {
          await redisClient.del(...acquiredLocks);
        }

        return res.status(409).json({
          message: `Seat ${seatNumber} is already locked by another user.`,
        });
      }

      acquiredLocks.push(lockKey);
    }

    return res.json({
      message: "Seats locked successfully.",
      showId,
      seatNumbers,
      expiresInSeconds: ttlSeconds,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to lock seats.", error: error.message });
  }
};
