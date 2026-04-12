const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    if (req.headers["x-user-role"] !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const { title, description, category, artist, language, durationMinutes, posterUrl, rating, slots } = req.body;

    if (!title || !description || !category || !artist || !language || !durationMinutes) {
      return res.status(400).json({ message: "Missing required event fields." });
    }
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "At least one slot is required." });
    }

    const event = await Event.create({
      title, description, category, artist, language,
      durationMinutes: Number(durationMinutes),
      posterUrl,
      rating: Number(rating || 4.5),
      slots: slots.map((s) => ({
        venueName:  s.venueName,
        city:       s.city,
        section:    s.section || "General",
        startTime:  s.startTime,
        price:      Number(s.price),
        totalSeats: Number(s.totalSeats || 40),
      })),
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create event.", error: error.message });
  }
};

exports.getEvents = async (_req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch events.", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch event.", error: error.message });
  }
};
