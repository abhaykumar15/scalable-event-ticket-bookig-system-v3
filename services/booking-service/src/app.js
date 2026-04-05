const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { rateLimit } = require("express-rate-limit");
const lockRoutes = require("./routes/lockRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));


const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    message: "Too many booking requests. Please try again later.",
  },
});

app.use("/seats", bookingLimiter);
app.use("/bookings", bookingLimiter);

app.use("/seats", lockRoutes);
app.use("/", bookingRoutes);

app.get("/health", (_req, res) => {
  return res.json({ service: "booking-service", status: "ok" });
  res.json({ status: "Booking service running 🎟️" });
});

app.use((err, _req, res, _next) => {
  console.error("Booking service error:", err);
  res.status(500).json({
    message: "Booking service encountered an unexpected error.",
  });
});

module.exports = app;
