require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./src/app");
const connectDB = require("./src/config/database");

const port = Number(process.env.PORT || 4001);
const PORT = port;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}`);
  });

  const shutdown = async () => {
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return;
  console.log(`🚀 Auth Service running on port ${PORT}`);
};

startServer().catch((error) => {
  console.error("Auth service failed to start:", error);
  process.exit(1);
});
