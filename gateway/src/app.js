
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const proxyRoutes = require("./routes/proxyRoutes");

const app = express();

// Trust the nginx load balancer sitting in front of the gateway
// so req.ip resolves to the real client IP, not the nginx container IP.
app.set("trust proxy", 1);

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));

app.use(proxyRoutes);

app.get("/health", (_req, res) => {
  return res.json({ service: "gateway", status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error("Gateway error:", err);
  res.status(500).json({ message: "Gateway encountered an unexpected error." });
});

module.exports = app;
