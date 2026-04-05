const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));

app.use("/", authRoutes);

app.get("/health", (_req, res) => {
  return res.json({ service: "auth-service", status: "ok" });
  res.json({ status: "Auth service running 🚀" });
});

app.use((err, _req, res, _next) => {
  console.error("Auth service error:", err);
  res.status(500).json({
    message: "Auth service encountered an unexpected error.",
  });
});

module.exports = app;
