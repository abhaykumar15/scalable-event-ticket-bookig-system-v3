import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤", "Concert": "🎵", "Theatre": "🎭",
  "Festival": "🎪", "Sports": "🏟️", "Conference": "🧠", "Other": "✨",
};

function EventCard({ event, onRefresh }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const emoji   = CATEGORY_EMOJI[event.category] || "✨";

  const [editing, setEditing]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event.title, description: event.description,
    category: event.category, artist: event.artist,
    language: event.language, durationMinutes: event.durationMinutes,
    rating: event.rating, posterUrl: event.posterUrl,
  });

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${event._id}`);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/events/${event._id}`, editForm);
      setEditing(false);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to update event.");
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await api.delete(`/events/${event._id}/slots/${slotId}`);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete slot.");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-3xl shadow-glow"
    >
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative min-h-72">
          <img
            src={event.posterUrl} alt={event.title}
            className="h-full w-full object-cover"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"; }}
          />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span>{emoji}</span><span>{event.category}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/70">{event.language} · {event.artist}</p>
              <h3 className="title-font text-3xl font-semibold">{event.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{event.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Duration</p>
                <p className="mt-1 text-lg font-semibold">{event.durationMinutes} min</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">⭐ {event.rating}/5</p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(true)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-amber-300/50">
                    ✏️ Edit
                  </button>
                  <button type="button" onClick={handleDelete} disabled={deleting}
                    className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-60">
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {editing && (
            <form onSubmit={handleUpdate} className="rounded-2xl border border-amber-300/20 bg-black/20 p-5 grid gap-3 md:grid-cols-2">
              <p className="md:col-span-2 text-xs uppercase tracking-[0.25em] text-amber-200/70 mb-1">Edit Event Details</p>
              {[
                { key: "title",           label: "Title" },
                { key: "artist",          label: "Artist" },
                { key: "language",        label: "Language" },
                { key: "durationMinutes", label: "Duration (min)", type: "number" },
                { key: "rating",          label: "Rating",         type: "number" },
                { key: "posterUrl",       label: "Poster URL",     span: true },
                { key: "description",     label: "Description",    span: true },
              ].map(({ key, label, type = "text", span }) => (
                <input key={key} type={type} placeholder={label} value={editForm[key]}
                  onChange={(e) => setEditForm((c) => ({ ...c, [key]: e.target.value }))}
                  className={`rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-300/50 ${span ? "md:col-span-2" : ""}`}
                />
              ))}
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-200">Save Changes</button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {event.slots.map((slot) => (
              <div key={slot._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-amber-100">{slot.venueName}</p>
                <p className="mt-1 text-sm text-white/60">{slot.city} · {slot.section}</p>
                <p className="mt-3 text-sm text-white/80">{new Date(slot.startTime).toLocaleString()}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Price</p>
                    <p className="text-lg font-semibold text-amber-200">₹{slot.price}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    {isAdmin && (
                      <button type="button" onClick={() => handleDeleteSlot(slot._id)}
                        className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-300 hover:bg-red-400/20">
                        🗑️
                      </button>
                    )}
                    <Link to={`/events/${event._id}/slots/${slot._id}/book`}
                      className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200">
                      Book Seats
                    </Link>
                  </div>
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