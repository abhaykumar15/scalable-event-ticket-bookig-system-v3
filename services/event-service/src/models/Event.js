const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    venueName:   { type: String, required: true, trim: true },
    city:        { type: String, required: true, trim: true },
    section:     { type: String, required: true, trim: true },   // e.g. "Floor", "Balcony A"
    startTime:   { type: Date,   required: true },
    price:       { type: Number, required: true, min: 0 },
    totalSeats:  { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category:    {
      type: String,
      required: true,
      enum: ["Standup Comedy", "Concert", "Theatre", "Festival", "Sports", "Conference", "Other"],
    },
    artist:      { type: String, required: true, trim: true },   // performer / headliner
    language:    { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    posterUrl:   { type: String, default: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80" },
    rating:      { type: Number, default: 4.5, min: 0, max: 5 },
    isActive:    { type: Boolean, default: true },
    slots:       { type: [slotSchema], default: [] },   // "slots" instead of "shows"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
