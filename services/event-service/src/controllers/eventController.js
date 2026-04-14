const Event = require("../models/Event");

const isAdmin = (req) => req.headers["x-user-role"] === "admin";

exports.createEvent = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const { title, description, category, artist, language, durationMinutes, posterUrl, rating, slots } = req.body;
    if (!title || !description || !category || !artist || !language || !durationMinutes)
      return res.status(400).json({ message: "Missing required event fields." });
    if (!Array.isArray(slots) || slots.length === 0)
      return res.status(400).json({ message: "At least one slot is required." });

    const event = await Event.create({
      title, description, category, artist, language,
      durationMinutes: Number(durationMinutes),
      posterUrl, rating: Number(rating || 4.5),
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

exports.updateEvent = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found." });

    const { title, description, category, artist, language, durationMinutes, posterUrl, rating } = req.body;
    if (title)           event.title           = title;
    if (description)     event.description     = description;
    if (category)        event.category        = category;
    if (artist)          event.artist          = artist;
    if (language)        event.language        = language;
    if (durationMinutes) event.durationMinutes = Number(durationMinutes);
    if (posterUrl)       event.posterUrl       = posterUrl;
    if (rating)          event.rating          = Number(rating);

    await event.save();
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update event.", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    event.isActive = false; // soft delete
    await event.save();
    return res.json({ message: "Event deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete event.", error: error.message });
  }
};

exports.addSlot = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found." });

    const { venueName, city, section, startTime, price, totalSeats } = req.body;
    if (!venueName || !city || !startTime || !price)
      return res.status(400).json({ message: "Missing required slot fields." });

    event.slots.push({
      venueName, city,
      section: section || "General",
      startTime, price: Number(price),
      totalSeats: Number(totalSeats || 40),
    });
    await event.save();
    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to add slot.", error: error.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found." });

    const slot = event.slots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    const { venueName, city, section, startTime, price, totalSeats } = req.body;
    if (venueName)  slot.venueName  = venueName;
    if (city)       slot.city       = city;
    if (section)    slot.section    = section;
    if (startTime)  slot.startTime  = startTime;
    if (price)      slot.price      = Number(price);
    if (totalSeats) slot.totalSeats = Number(totalSeats);

    await event.save();
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update slot.", error: error.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
    const event = await Event.findById(req.params.eventId);
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found." });

    const slotIndex = event.slots.findIndex((s) => s._id.toString() === req.params.slotId);
    if (slotIndex === -1) return res.status(404).json({ message: "Slot not found." });

    event.slots.splice(slotIndex, 1);
    await event.save();
    return res.json({ message: "Slot deleted successfully.", event });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete slot.", error: error.message });
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
    if (!event || !event.isActive) return res.status(404).json({ message: "Event not found." });
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch event.", error: error.message });
  }
};