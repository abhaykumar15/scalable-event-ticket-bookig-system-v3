require("dotenv").config();

const app = require("./src/app");
const connectRabbit = require("./src/config/broker");

const port = Number(process.env.PORT || 4005);
const PORT = port;

const startServer = async () => {
  await connectRabbit();

  app.listen(PORT, () => {
    console.log(`Notification service listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Notification service failed to start:", error);
  process.exit(1);
});
