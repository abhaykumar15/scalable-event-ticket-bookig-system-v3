const Movie = require("../models/Movie");

const isAdmin = (req) => req.headers["x-user-role"] === "admin";

exports.createMovie = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const { title, description, genre, language, durationMinutes, posterUrl, rating, shows } = req.body;
    if (!title || !description || !genre || !language || !durationMinutes)
      return res.status(400).json({ message: "Missing required movie fields." });
    if (!Array.isArray(shows) || shows.length === 0)
      return res.status(400).json({ message: "At least one show is required." });

    const normalizedShows = shows.map((show) => ({
      theatreName: show.theatreName,
      city:        show.city,
      screenName:  show.screenName || "Screen 1",
      date:        show.date || new Date(show.startTime).toISOString().split("T")[0],
      startTime:   show.startTime,
      price:       Number(show.price),
      totalSeats:  Number(show.totalSeats || 40),
    }));

    const movie = await Movie.create({
      title, description, genre, language,
      durationMinutes: Number(durationMinutes),
      posterUrl, rating: Number(rating || 4.5),
      shows: normalizedShows,
    });
    return res.status(201).json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create movie.", error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) return res.status(404).json({ message: "Movie not found." });

    const { title, description, genre, language, durationMinutes, posterUrl, rating } = req.body;
    if (title)           movie.title           = title;
    if (description)     movie.description     = description;
    if (genre)           movie.genre           = genre;
    if (language)        movie.language        = language;
    if (durationMinutes) movie.durationMinutes = Number(durationMinutes);
    if (posterUrl)       movie.posterUrl       = posterUrl;
    if (rating)          movie.rating          = Number(rating);

    await movie.save();
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update movie.", error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });

    movie.isActive = false; // soft delete
    await movie.save();
    return res.json({ message: "Movie deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete movie.", error: error.message });
  }
};

exports.addShow = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) return res.status(404).json({ message: "Movie not found." });

    const { theatreName, city, screenName, date, startTime, price, totalSeats } = req.body;
    if (!theatreName || !city || !startTime || !price || !date)
      return res.status(400).json({ message: "Missing required show fields." });

    movie.shows.push({
      theatreName, city,
      screenName: screenName || "Screen 1",
      date, startTime,
      price:      Number(price),
      totalSeats: Number(totalSeats || 40),
    });
    await movie.save();
    return res.status(201).json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to add show.", error: error.message });
  }
};

exports.updateShow = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) return res.status(404).json({ message: "Movie not found." });

    const show = movie.shows.id(req.params.showId);
    if (!show) return res.status(404).json({ message: "Show not found." });

    const { theatreName, city, screenName, date, startTime, price, totalSeats } = req.body;
    if (theatreName) show.theatreName = theatreName;
    if (city)        show.city        = city;
    if (screenName)  show.screenName  = screenName;
    if (date)        show.date        = date;
    if (startTime)   show.startTime   = startTime;
    if (price)       show.price       = Number(price);
    if (totalSeats)  show.totalSeats  = Number(totalSeats);

    await movie.save();
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update show.", error: error.message });
  }
};

exports.deleteShow = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) return res.status(404).json({ message: "Movie not found." });

    const showIndex = movie.shows.findIndex((s) => s._id.toString() === req.params.showId);
    if (showIndex === -1) return res.status(404).json({ message: "Show not found." });

    movie.shows.splice(showIndex, 1);
    await movie.save();
    return res.json({ message: "Show deleted successfully.", movie });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete show.", error: error.message });
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
    if (!movie || !movie.isActive) return res.status(404).json({ message: "Movie not found." });
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch movie.", error: error.message });
  }
};