/**
 * Seed script – populates the movie-service MongoDB with dummy movies.
 *
 * Usage:
 *   docker exec -it movie-service node seed.js
 *   MONGO_URI=mongodb://localhost:27017/ticket_movie node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ticket_movie";

const showSchema = new mongoose.Schema(
  { theatreName: String, city: String, screenName: String, date: String, startTime: Date, price: Number, totalSeats: Number },
  { _id: true }
);
const movieSchema = new mongoose.Schema(
  {
    title: String, description: String, genre: String, language: String,
    durationMinutes: Number, posterUrl: String,
    rating: Number, isActive: { type: Boolean, default: true }, shows: [showSchema],
  },
  { timestamps: true }
);
const Movie = mongoose.model("Movie", movieSchema);

const daysFromNow = (d, h = 10, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt;
};

const toDateStr = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split("T")[0];
};

const movies = [
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genre: "Sci-Fi",
    language: "English",
    durationMinutes: 169,
    rating: 4.9,
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    shows: [
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(1), startTime: daysFromNow(1, 10, 0),  price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(1), startTime: daysFromNow(1, 14, 30), price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(1), startTime: daysFromNow(1, 19, 0),  price: 250, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(2), startTime: daysFromNow(2, 10, 0),  price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(2), startTime: daysFromNow(2, 14, 30), price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(2), startTime: daysFromNow(2, 19, 0),  price: 250, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(3), startTime: daysFromNow(3, 10, 0),  price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(3), startTime: daysFromNow(3, 14, 30), price: 220, totalSeats: 40 },
      { theatreName: "PVR Cinemas", city: "Chennai", screenName: "Screen 1", date: toDateStr(3), startTime: daysFromNow(3, 19, 0),  price: 250, totalSeats: 40 },
    ],
  },
];

async function seed() {
  console.log(`\n🎬  Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  const existing = await Movie.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️   ${existing} movie(s) already exist. Clearing …`);
    await Movie.deleteMany({});
  }

  console.log(`⏳  Inserting ${movies.length} movies …`);
  const inserted = await Movie.insertMany(movies);
  console.log(`✅  Inserted ${inserted.length} movies:\n`);
  inserted.forEach((m) => console.log(`    • [${m.genre}] ${m.title}  (${m.shows.length} show${m.shows.length !== 1 ? "s" : ""} across 3 dates)`));

  await mongoose.disconnect();
  console.log("\n🎉  Seed complete!\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});