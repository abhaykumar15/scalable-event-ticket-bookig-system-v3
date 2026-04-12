const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));
app.use("/", eventRoutes);

app.get("/health", (_req, res) => res.json({ service: "event-service", status: "ok" }));

app.use((err, _req, res, _next) => {
  console.error("Event service error:", err);
  res.status(500).json({ message: "Event service encountered an unexpected error." });
});

module.exports = app;
