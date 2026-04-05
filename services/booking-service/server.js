require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./src/app");
const connectDB = require("./src/config/database");
const { connectRedis, disconnectRedis } = require("./src/config/redis");
const { connectRabbit } = require("./src/config/rabbit");
const startConsumer = require("./src/consumer");

const port = Number(process.env.PORT || 4003);
const PORT = port;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbit();
    await startConsumer();

    const server = app.listen(PORT, () => {
      console.log(`Booking service listening on port ${PORT}`);
    });

    const shutdown = async () => {
      await disconnectRedis();
      await mongoose.connection.close();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start booking service:", err);
    process.exit(1);
  }
};

startServer();
