const mongoose = require("mongoose");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ticket_booking";

  let connected = false;

  while (!connected) {
    try {
      await mongoose.connect(mongoUri);
      connected = true;
      console.log("Booking service connected to MongoDB");
    } catch (error) {
      console.error("Booking service MongoDB connection failed. Retrying...", error.message);
      await sleep(5000);
    }
  }
};

module.exports = connectDB;
