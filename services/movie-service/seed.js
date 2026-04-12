/**
 * Seed script – populates the movie-service MongoDB with dummy movies.
 *
 * Usage (from the movie-service directory):
 *   node seed.js
 *
 * Or from the project root with Docker running:
 *   docker exec -it movie-service node seed.js
 *
 * Override the DB URI:
 *   MONGO_URI=mongodb://localhost:27017/ticket_movie node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ticket_movie";

// ── Inline model (avoids importing app code) ───────────────────────────────
const showSchema = new mongoose.Schema(
  {
    theatreName: { type: String, required: true },
    city:        { type: String, required: true },
    screenName:  { type: String, required: true },
    startTime:   { type: Date,   required: true },
    price:       { type: Number, required: true },
    totalSeats:  { type: Number, required: true },
  },
  { _id: true }
);

const movieSchema = new mongoose.Schema(
  {
    title:           { type: String,  required: true },
    description:     { type: String,  required: true },
    genre:           { type: String,  required: true },
    language:        { type: String,  required: true },
    durationMinutes: { type: Number,  required: true },
    posterUrl:       { type: String },
    rating:          { type: Number,  default: 4.5 },
    isActive:        { type: Boolean, default: true },
    shows:           { type: [showSchema], default: [] },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

// ── Helper: produce show dates relative to now ─────────────────────────────
const daysFromNow = (d, h = 18, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt;
};

// ── Seed data ──────────────────────────────────────────────────────────────
const movies = [
  {
    title: "Interstellar Echoes",
    description:
      "A crew of astronauts ventures beyond the known galaxy chasing a signal that could save humanity — or doom it forever. A breathtaking journey through time, space, and sacrifice.",
    genre: "Sci-Fi",
    language: "English",
    durationMinutes: 169,
    rating: 4.8,
    posterUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "PVR Cinemas",
        city: "Chennai",
        screenName: "IMAX Screen 1",
        startTime: daysFromNow(1, 10, 30),
        price: 450,
        totalSeats: 60,
      },
      {
        theatreName: "Inox Grand",
        city: "Coimbatore",
        screenName: "Screen 3",
        startTime: daysFromNow(1, 19, 0),
        price: 320,
        totalSeats: 40,
      },
      {
        theatreName: "SPI Cinemas",
        city: "Bangalore",
        screenName: "Screen 2",
        startTime: daysFromNow(2, 14, 0),
        price: 380,
        totalSeats: 50,
      },
    ],
  },
  {
    title: "Midnight Masquerade",
    description:
      "When a detective infiltrates a secret society of the city's elite, she discovers that the masks people wear run far deeper than silk and gold — and getting out may cost her everything.",
    genre: "Thriller",
    language: "English",
    durationMinutes: 128,
    rating: 4.5,
    posterUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Cinepolis",
        city: "Mumbai",
        screenName: "Screen 4",
        startTime: daysFromNow(1, 21, 0),
        price: 300,
        totalSeats: 40,
      },
      {
        theatreName: "PVR Cinemas",
        city: "Delhi",
        screenName: "Screen 1",
        startTime: daysFromNow(2, 18, 30),
        price: 350,
        totalSeats: 45,
      },
    ],
  },
  {
    title: "Vettai Thiruvizha",
    description:
      "A fearless cop from a sleepy hill town is thrown into the web of a city crime syndicate after his brother goes missing. Action, emotion, and breathtaking chase sequences collide.",
    genre: "Action",
    language: "Tamil",
    durationMinutes: 155,
    rating: 4.6,
    posterUrl:
      "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Rohini Silver Screens",
        city: "Chennai",
        screenName: "Screen 1",
        startTime: daysFromNow(0, 10, 0),
        price: 200,
        totalSeats: 60,
      },
      {
        theatreName: "Sathyam Cinemas",
        city: "Chennai",
        screenName: "Screen 2",
        startTime: daysFromNow(0, 18, 30),
        price: 250,
        totalSeats: 50,
      },
      {
        theatreName: "KG Cinemas",
        city: "Coimbatore",
        screenName: "Screen 1",
        startTime: daysFromNow(1, 13, 0),
        price: 180,
        totalSeats: 40,
      },
    ],
  },
  {
    title: "The Last Monsoon",
    description:
      "Set against the lush backdrop of coastal Kerala, two estranged siblings reunite after their father's death only to unearth long-buried family secrets that rewrite everything they know.",
    genre: "Drama",
    language: "Malayalam",
    durationMinutes: 142,
    rating: 4.7,
    posterUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Carnival Cinemas",
        city: "Kochi",
        screenName: "Screen 2",
        startTime: daysFromNow(1, 11, 0),
        price: 220,
        totalSeats: 45,
      },
      {
        theatreName: "PVR Lulu",
        city: "Kochi",
        screenName: "Screen 5",
        startTime: daysFromNow(2, 20, 0),
        price: 280,
        totalSeats: 50,
      },
    ],
  },
  {
    title: "Neon Ronin",
    description:
      "In a neon-soaked dystopian Tokyo, a disgraced samurai turned street enforcer must protect a child who holds the key to humanity's last hope from a ruthless megacorp.",
    genre: "Action",
    language: "Japanese",
    durationMinutes: 137,
    rating: 4.4,
    posterUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Inox Insignia",
        city: "Hyderabad",
        screenName: "Premier Screen",
        startTime: daysFromNow(2, 16, 30),
        price: 400,
        totalSeats: 35,
      },
      {
        theatreName: "AMB Cinemas",
        city: "Hyderabad",
        screenName: "Screen 3",
        startTime: daysFromNow(3, 21, 0),
        price: 350,
        totalSeats: 40,
      },
    ],
  },
  {
    title: "Kal Ka Sapna",
    description:
      "A small-town dreamer moves to Mumbai with ₹500 and a guitar, determined to make it as a singer. A heartwarming musical journey about failure, friendship, and finding your voice.",
    genre: "Musical",
    language: "Hindi",
    durationMinutes: 148,
    rating: 4.3,
    posterUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Cinepolis Viviana",
        city: "Mumbai",
        screenName: "Screen 6",
        startTime: daysFromNow(1, 12, 0),
        price: 250,
        totalSeats: 45,
      },
      {
        theatreName: "PVR Icon",
        city: "Pune",
        screenName: "Screen 2",
        startTime: daysFromNow(2, 19, 30),
        price: 280,
        totalSeats: 40,
      },
    ],
  },
  {
    title: "Frozen Frontier",
    description:
      "A survival thriller set in the Arctic: when their research station goes dark, a team of scientists must trek 200 km through blizzards, bearing secrets that someone will kill to keep buried.",
    genre: "Thriller",
    language: "English",
    durationMinutes: 122,
    rating: 4.2,
    posterUrl:
      "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "Miraj Cinemas",
        city: "Bangalore",
        screenName: "Screen 1",
        startTime: daysFromNow(3, 15, 0),
        price: 230,
        totalSeats: 40,
      },
    ],
  },
  {
    title: "Cosmic Laughter",
    description:
      "A hapless intergalactic travel agent accidentally books Earth on a universal tour — chaos, comedy, and unlikely friendships ensue as aliens flood every major city.",
    genre: "Comedy",
    language: "English",
    durationMinutes: 108,
    rating: 4.1,
    posterUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    shows: [
      {
        theatreName: "PVR Cinemas",
        city: "Delhi",
        screenName: "Screen 7",
        startTime: daysFromNow(1, 17, 0),
        price: 270,
        totalSeats: 50,
      },
      {
        theatreName: "Inox R-City",
        city: "Mumbai",
        screenName: "Screen 4",
        startTime: daysFromNow(2, 13, 30),
        price: 290,
        totalSeats: 45,
      },
    ],
  },
];

// ── Run ────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🎬  Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  const existing = await Movie.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️   ${existing} movie(s) already exist. Clearing collection first …`);
    await Movie.deleteMany({});
    console.log("🗑️   Cleared.\n");
  }

  console.log(`⏳  Inserting ${movies.length} movies …`);
  const inserted = await Movie.insertMany(movies);
  console.log(`✅  Inserted ${inserted.length} movies:\n`);
  inserted.forEach((m) => console.log(`    • ${m.title}  (${m.shows.length} show${m.shows.length !== 1 ? "s" : ""})`));

  await mongoose.disconnect();
  console.log("\n🎉  Seed complete! Refresh your browser.\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
