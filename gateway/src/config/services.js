module.exports = {
  authService: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  movieService: process.env.MOVIE_SERVICE_URL || "http://localhost:4002",
  bookingService: process.env.BOOKING_SERVICE_URL || "http://localhost:4003",
  paymentService: process.env.PAYMENT_SERVICE_URL || "http://localhost:4004",
  notificationService:
    process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005",
};
