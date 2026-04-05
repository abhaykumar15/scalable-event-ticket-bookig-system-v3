const express = require("express");
const movieRoutes = require("./routes/movieRoutes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));
app.use("/movies", movieRoutes);

app.get("/health", (_req, res) => {
  return res.json({ service: "movie-service", status: "ok" });
  res.json({ status: "Movie service running 🎬" });
});

app.use((err, _req, res, _next) => {
  console.error("Movie service error:", err);
  res.status(500).json({
    message: "Movie service encountered an unexpected error.",
  });
});

module.exports = app;
