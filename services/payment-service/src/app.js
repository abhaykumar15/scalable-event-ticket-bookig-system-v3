const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  return res.json({ service: "payment-service", status: "ok" });
  res.json({ status: "Payment service running 💳" });
});

module.exports = app;
