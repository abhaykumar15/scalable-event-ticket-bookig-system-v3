const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const proxyRoutes = require("./routes/proxyRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
//app.use(express.json());
app.use(morgan("combined"));

app.use(proxyRoutes);

app.get("/health", (_req, res) => {
  return res.json({ service: "gateway", status: "ok" });
  res.json({ status: "Gateway running 🚀" });
});

app.use((err, _req, res, _next) => {
  console.error("Gateway error:", err);
  res.status(500).json({
    message: "Gateway encountered an unexpected error.",
  });
});

module.exports = app;
