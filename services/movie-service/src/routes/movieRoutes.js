const express = require("express");
const { createMovie, getMovies, getMovieById, addShow } = require("../controllers/movieController");

const router = express.Router();

router.get("/",              getMovies);
router.get("/:movieId",     getMovieById);
router.post("/",            createMovie);
router.post("/:movieId/shows", addShow); // NEW

module.exports = router;