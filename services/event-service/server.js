require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = Number(process.env.PORT || 4006);

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => console.log(`Event service listening on port ${PORT}`));
  const shutdown = async () => {
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer().catch((error) => {
  console.error("Event service failed to start:", error);
  process.exit(1);
});
