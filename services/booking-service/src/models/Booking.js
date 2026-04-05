const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    showId: {
      type: String,
      required: true,
      index: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    showStartTime: {
      type: Date,
      required: true,
    },
    seatNumbers: {
      type: [String],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAYMENT_SUCCESS", "PAYMENT_FAILED"],
      default: "PENDING_PAYMENT",
    },
    paymentAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
