const express = require("express");
const {
  createMovie, getMovies, getMovieById,
  updateMovie, deleteMovie,
  addShow, updateShow, deleteShow,
} = require("../controllers/movieController");

const router = express.Router();

router.get("/",                          getMovies);
router.get("/:movieId",                  getMovieById);
router.post("/",                         createMovie);
router.put("/:movieId",                  updateMovie);
router.delete("/:movieId",               deleteMovie);
router.post("/:movieId/shows",           addShow);
router.put("/:movieId/shows/:showId",    updateShow);
router.delete("/:movieId/shows/:showId", deleteShow);

module.exports = router;