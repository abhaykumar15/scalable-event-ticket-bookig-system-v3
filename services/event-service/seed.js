/**
 * Seed script – populates the event-service MongoDB with dummy events.
 *
 * Usage:
 *   docker exec -it event-service node seed.js
 *   MONGO_URI=mongodb://localhost:27017/ticket_event node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ticket_event";

const slotSchema = new mongoose.Schema(
  { venueName: String, city: String, section: String, startTime: Date, price: Number, totalSeats: Number },
  { _id: true }
);
const eventSchema = new mongoose.Schema(
  {
    title: String, description: String, category: String, artist: String,
    language: String, durationMinutes: Number, posterUrl: String,
    rating: Number, isActive: { type: Boolean, default: true }, slots: [slotSchema],
  },
  { timestamps: true }
);
const Event = mongoose.model("Event", eventSchema);

const daysFromNow = (d, h = 19, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt;
};

const events = [
  {
    title: "Laugh Out Loud – Stand-up Spectacular",
    description: "Five of India's sharpest comedians take the stage for an unfiltered, laugh-till-you-cry night. Expect sharp observations, chaotic storytelling, and zero chill.",
    category: "Standup Comedy",
    artist: "Zakir Khan, Rahul Subramanian & Friends",
    language: "Hindi / English",
    durationMinutes: 120,
    rating: 4.8,
    posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "The Comedy Store", city: "Mumbai", section: "Floor", startTime: daysFromNow(3, 19, 30), price: 799, totalSeats: 80 },
      { venueName: "Canvas Laugh Club", city: "Delhi", section: "General", startTime: daysFromNow(5, 20, 0), price: 699, totalSeats: 60 },
    ],
  },
  {
    title: "Neon Nights – Electronic Music Festival",
    description: "A 360° immersive electronic music experience across three stages. Headlined by internationally acclaimed DJs, the night promises pulsating beats, laser shows, and a crowd that never stops.",
    category: "Concert",
    artist: "Martin Garrix, KSHMR & More",
    language: "Instrumental",
    durationMinutes: 360,
    rating: 4.9,
    posterUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "MMRDA Grounds", city: "Mumbai", section: "General Admission", startTime: daysFromNow(7, 17, 0), price: 2499, totalSeats: 200 },
      { venueName: "MMRDA Grounds", city: "Mumbai", section: "VIP Lounge", startTime: daysFromNow(7, 17, 0), price: 5999, totalSeats: 40 },
      { venueName: "Palace Grounds", city: "Bangalore", section: "General Admission", startTime: daysFromNow(10, 17, 0), price: 2199, totalSeats: 150 },
    ],
  },
  {
    title: "Echoes of Carnatic – A Classical Evening",
    description: "An intimate evening of Carnatic classical music celebrating the compositions of Thyagaraja. Performed by award-winning vocalists and a live ensemble, this is a night of pure musical tradition.",
    category: "Concert",
    artist: "Sanjay Subrahmanyan",
    language: "Tamil / Telugu",
    durationMinutes: 150,
    rating: 4.7,
    posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "Sri Krishna Gana Sabha", city: "Chennai", section: "Main Hall", startTime: daysFromNow(2, 18, 30), price: 500, totalSeats: 60 },
      { venueName: "Nehru Centre", city: "Mumbai", section: "Auditorium", startTime: daysFromNow(4, 19, 0), price: 600, totalSeats: 50 },
    ],
  },
  {
    title: "Hamlet Reimagined",
    description: "A bold modern retelling of Shakespeare's Hamlet set in a corporate boardroom. Featuring an all-Indian cast, original Hindi dialogue, and stunning minimalist staging that will leave you breathless.",
    category: "Theatre",
    artist: "Naseeruddin Shah & The Motley Ensemble",
    language: "Hindi",
    durationMinutes: 140,
    rating: 4.6,
    posterUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "Prithvi Theatre", city: "Mumbai", section: "Main Stage", startTime: daysFromNow(1, 19, 30), price: 450, totalSeats: 45 },
      { venueName: "Prithvi Theatre", city: "Mumbai", section: "Main Stage", startTime: daysFromNow(2, 19, 30), price: 450, totalSeats: 45 },
      { venueName: "Ranga Shankara", city: "Bangalore", section: "Main Hall", startTime: daysFromNow(6, 19, 0), price: 400, totalSeats: 40 },
    ],
  },
  {
    title: "Sunburn Arena – Coimbatore",
    description: "The iconic Sunburn brand brings its high-energy arena show to Coimbatore for the first time. Featuring chart-topping DJ sets, pyrotechnics, and an electrifying crowd — the south's biggest night out.",
    category: "Festival",
    artist: "Nucleya & Ritviz",
    language: "Instrumental / Hindi",
    durationMinutes: 240,
    rating: 4.5,
    posterUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "CODISSIA Trade Fair Complex", city: "Coimbatore", section: "General Admission", startTime: daysFromNow(5, 18, 0), price: 1499, totalSeats: 120 },
      { venueName: "CODISSIA Trade Fair Complex", city: "Coimbatore", section: "Gold Zone", startTime: daysFromNow(5, 18, 0), price: 2999, totalSeats: 30 },
    ],
  },
  {
    title: "Open Mic Madness – Season 4",
    description: "Chennai's most chaotic and beloved open-mic night returns. Part comedy, part music, part total unpredictability — you never know who will walk on next. Audience participation guaranteed.",
    category: "Standup Comedy",
    artist: "Various Artists",
    language: "Tamil / English",
    durationMinutes: 90,
    rating: 4.3,
    posterUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "Crowne Plaza", city: "Chennai", section: "Ballroom", startTime: daysFromNow(1, 20, 0), price: 299, totalSeats: 50 },
      { venueName: "Laila", city: "Chennai", section: "Rooftop", startTime: daysFromNow(4, 20, 30), price: 349, totalSeats: 40 },
    ],
  },
  {
    title: "Pro Kabaddi Live Experience",
    description: "Watch live Pro Kabaddi league matches in a stadium-style setup with giant screens, live commentary, food courts, and interactive fan zones. Get closer to the game than ever before.",
    category: "Sports",
    artist: "Jaipur Pink Panthers vs Tamil Thalaivas",
    language: "Hindi / Tamil",
    durationMinutes: 90,
    rating: 4.4,
    posterUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "Jawaharlal Nehru Stadium", city: "Chennai", section: "Lower Tier", startTime: daysFromNow(3, 20, 0), price: 350, totalSeats: 80 },
      { venueName: "Jawaharlal Nehru Stadium", city: "Chennai", section: "Upper Tier", startTime: daysFromNow(3, 20, 0), price: 199, totalSeats: 60 },
    ],
  },
  {
    title: "Future of Tech Summit 2026",
    description: "A full-day conference bringing together India's top founders, engineers, and investors to explore AI, Web3, and sustainable tech. Keynotes, panels, workshops, and serious networking.",
    category: "Conference",
    artist: "Kunal Shah, Nikhil Kamath & 20+ Speakers",
    language: "English",
    durationMinutes: 480,
    rating: 4.6,
    posterUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    slots: [
      { venueName: "Bangalore International Exhibition Centre", city: "Bangalore", section: "Conference Hall A", startTime: daysFromNow(8, 9, 0), price: 1999, totalSeats: 100 },
      { venueName: "Bangalore International Exhibition Centre", city: "Bangalore", section: "VIP Pass", startTime: daysFromNow(8, 9, 0), price: 4999, totalSeats: 20 },
    ],
  },
];

async function seed() {
  console.log(`\n🎪  Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  const existing = await Event.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️   ${existing} event(s) already exist. Clearing …`);
    await Event.deleteMany({});
  }

  console.log(`⏳  Inserting ${events.length} events …`);
  const inserted = await Event.insertMany(events);
  console.log(`✅  Inserted ${inserted.length} events:\n`);
  inserted.forEach((e) => console.log(`    • [${e.category}] ${e.title}  (${e.slots.length} slot${e.slots.length !== 1 ? "s" : ""})`));

  await mongoose.disconnect();
  console.log("\n🎉  Seed complete!\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
