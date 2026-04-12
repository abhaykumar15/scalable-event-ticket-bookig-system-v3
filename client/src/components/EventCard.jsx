import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤",
  "Concert":        "🎵",
  "Theatre":        "🎭",
  "Festival":       "🎪",
  "Sports":         "🏟️",
  "Conference":     "🧠",
  "Other":          "✨",
};

function EventCard({ event }) {
  const emoji = CATEGORY_EMOJI[event.category] || "✨";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-3xl shadow-glow"
    >
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        {/* Poster */}
        <div className="relative min-h-72">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80";
            }}
          />
          {/* Category badge overlay */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span>{emoji}</span>
            <span>{event.category}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                {event.language} · {event.artist}
              </p>
              <h3 className="title-font text-3xl font-semibold">{event.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {event.description}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Duration</p>
              <p className="mt-1 text-lg font-semibold">{event.durationMinutes} min</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">
                ⭐ {event.rating}/5
              </p>
            </div>
          </div>

          {/* Slots */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {event.slots.map((slot) => (
              <div
                key={slot._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-amber-100">{slot.venueName}</p>
                <p className="mt-1 text-sm text-white/60">
                  {slot.city} · {slot.section}
                </p>
                <p className="mt-3 text-sm text-white/80">
                  {new Date(slot.startTime).toLocaleString()}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Price</p>
                    <p className="text-lg font-semibold text-amber-200">₹{slot.price}</p>
                  </div>
                  <Link
                    to={`/events/${event._id}/slots/${slot._id}/book`}
                    className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
                  >
                    Book Seats
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default EventCard;
