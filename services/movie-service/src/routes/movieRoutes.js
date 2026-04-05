const express = require("express");

const {
  createMovie,
  getMovies,
  getMovieById,
} = require("../controllers/movieController");

const router = express.Router();

router.get("/", getMovies);
router.get("/:movieId", getMovieById);
router.post("/", createMovie);

module.exports = router;
