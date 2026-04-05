const Movie = require("../models/Movie");

exports.createMovie = async (req, res) => {
  try {
    if (req.headers["x-user-role"] !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const {
      title,
      description,
      genre,
      language,
      durationMinutes,
      posterUrl,
      rating,
      shows,
    } = req.body;

    if (!title || !description || !genre || !language || !durationMinutes) {
      return res.status(400).json({ message: "Missing required movie fields." });
    }

    if (!Array.isArray(shows) || shows.length === 0) {
      return res.status(400).json({ message: "At least one show is required." });
    }

    const normalizedShows = shows.map((show) => ({
      theatreName: show.theatreName,
      city: show.city,
      screenName: show.screenName || "Screen 1",
      startTime: show.startTime,
      price: Number(show.price),
      totalSeats: Number(show.totalSeats || 40),
    }));

    const movie = await Movie.create({
      title,
      description,
      genre,
      language,
      durationMinutes: Number(durationMinutes),
      posterUrl,
      rating: Number(rating || 4.5),
      shows: normalizedShows,
    });

    return res.status(201).json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create movie.", error: error.message });
  }
};

exports.getMovies = async (_req, res) => {
  try {
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch movies.", error: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: "Movie not found." });
    }

    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch movie.", error: error.message });
  }
};
