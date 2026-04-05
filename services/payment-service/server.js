require("dotenv").config();

const app = require("./src/app");
const connectRabbit = require("./src/config/broker");

const port = Number(process.env.PORT || 4004);
const PORT = port;

const startServer = async () => {
  await connectRabbit();

  app.listen(PORT, () => {
    console.log(`Payment service listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Payment service failed to start:", error);
  process.exit(1);
});
