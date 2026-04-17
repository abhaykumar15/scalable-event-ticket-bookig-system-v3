import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import api from "../api/client";
import Carousel from "../components/Carousel";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Standup Comedy", "Concert", "Theatre", "Festival", "Sports", "Conference", "Other"];
const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤", "Concert": "🎵", "Theatre": "🎭",
  "Festival": "🎪", "Sports": "🏟️", "Conference": "🧠", "Other": "✨",
};

const emptyEventForm = {
  title: "", description: "", category: "Concert", artist: "",
  language: "", durationMinutes: 90, posterUrl: "", rating: 4.5,
};

const emptySlot = {
  venueName: "", city: "", section: "General",
  startTime: "", price: 599, totalSeats: 60,
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents]         = useState([]);
  const [form, setForm]             = useState(emptyEventForm);
  const [slots, setSlots]           = useState([{ ...emptySlot }]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [filter, setFilter]         = useState("ALL");
  const [query, setQuery]           = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // Slot row helpers
  const addSlot    = () => setSlots((s) => [...s, { ...emptySlot }]);
  const removeSlot = (i) => setSlots((s) => s.filter((_, idx) => idx !== i));
  const updateSlot = (i, key, val) =>
    setSlots((s) => s.map((sl, idx) => idx === i ? { ...sl, [key]: val } : sl));

  const createEvent = async (e) => {
    e.preventDefault();
    if (slots.some((s) => !s.venueName || !s.city || !s.startTime || !s.price)) {
      setError("Please fill all required fields for every slot.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/events", {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        rating: Number(form.rating),
        slots: slots.map((s) => ({
          venueName:  s.venueName,
          city:       s.city,
          section:    s.section || "General",
          startTime:  s.startTime,
          price:      Number(s.price),
          totalSeats: Number(s.totalSeats),
        })),
      });
      setForm(emptyEventForm);
      setSlots([{ ...emptySlot }]);
      await fetchEvents();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const featured = useMemo(
    () => [...events].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [events]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = filter === "ALL" ? events : events.filter((ev) => ev.category === filter);
    if (q) {
      result = result.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          ev.artist.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q) ||
          ev.language.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filter, query]);

  return (
    <div className="page-shell">

      {/* ── Carousel ── */}
      {loading ? (
        <div className="flex h-[380px] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
        </div>
      ) : featured.length > 0 ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/50">Trending Events</p>
          <Carousel items={featured} mode="events" />
        </div>
      ) : null}

      {/* ── Hero / Search ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-[2rem] p-8"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/70">Live Experiences</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="title-font text-3xl font-semibold sm:text-4xl">
              Concerts, comedy, theatre — live events you'll never forget.
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/55">
              Search by name, artist, or category to find your next live experience.
            </p>
          </div>
          <div className="shrink-0 rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Signed in as</p>
            <p className="mt-1 title-font text-xl font-semibold">{user?.role}</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-6 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search by title, artist, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-10 text-sm outline-none transition placeholder:text-white/30 focus:border-amber-300/50 focus:bg-black/40"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition text-sm"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        {query && (
          <p className="mt-2 text-xs text-white/40">
            {filtered.length === 0
              ? `No events match "${query}"`
              : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        )}
      </motion.section>

      {/* ── Admin panel ── */}
      {user?.role === "admin" && (
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Admin Panel</p>
            <h2 className="title-font mt-3 text-3xl font-semibold">Publish an Event</h2>
            <p className="mt-1 text-sm text-white/50">Fill event details, then add one or more slots across venues and dates.</p>
          </div>

          <form onSubmit={createEvent} className="flex flex-col gap-8">

            {/* ── Event details ── */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-amber-200/60">🎪 Event Details</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-900">{CATEGORY_EMOJI[cat]} {cat}</option>
                  ))}
                </select>
                <input required type="text"   placeholder="Event Title"      value={form.title}           onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}           className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="text"   placeholder="Artist / Headliner" value={form.artist}         onChange={(e) => setForm((c) => ({ ...c, artist: e.target.value }))}          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="text"   placeholder="Language"         value={form.language}        onChange={(e) => setForm((c) => ({ ...c, language: e.target.value }))}        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="number" placeholder="Duration (min)"   value={form.durationMinutes} onChange={(e) => setForm((c) => ({ ...c, durationMinutes: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" min="1" />
                <input          type="number" placeholder="Rating (0–5)"     value={form.rating}          onChange={(e) => setForm((c) => ({ ...c, rating: e.target.value }))}          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" step="0.1" min="0" max="5" />
                <input          type="url"    placeholder="Poster URL"        value={form.posterUrl}       onChange={(e) => setForm((c) => ({ ...c, posterUrl: e.target.value }))}       className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50 xl:col-span-2" />
                <textarea required placeholder="Description" value={form.description} rows={2}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  className="xl:col-span-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50 resize-none"
                />
              </div>
            </div>

            {/* ── Slots ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">🎟️ Slots ({slots.length})</p>
                <button
                  type="button"
                  onClick={addSlot}
                  className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/20"
                >
                  + Add Slot
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {slots.map((slot, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold text-white/60">Slot #{i + 1}</p>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="rounded-lg border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-300 hover:bg-red-400/20"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <input required type="text"           placeholder="Venue Name"    value={slot.venueName}  onChange={(e) => updateSlot(i, "venueName",  e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="text"           placeholder="City"          value={slot.city}       onChange={(e) => updateSlot(i, "city",       e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input          type="text"           placeholder="Section (e.g. Floor, VIP)" value={slot.section} onChange={(e) => updateSlot(i, "section", e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="datetime-local" placeholder="Start Time"   value={slot.startTime}  onChange={(e) => updateSlot(i, "startTime",  e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="number"         placeholder="Price (₹)"    value={slot.price}      onChange={(e) => updateSlot(i, "price",      e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" min="0" />
                      <input required type="number"         placeholder="Total Seats"  value={slot.totalSeats} onChange={(e) => updateSlot(i, "totalSeats", e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" min="1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded-2xl bg-amber-300 px-8 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60"
            >
              {submitting ? "Publishing..." : `Publish Event with ${slots.length} Slot${slots.length > 1 ? "s" : ""}`}
            </button>
          </form>
        </motion.section>
      )}

      {error && !submitting && <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">{error}</p>}

      {/* ── Category filter pills ── */}
      {!loading && events.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter("ALL")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === "ALL" ? "bg-amber-300 text-black" : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}>
            All
          </button>
          {CATEGORIES.filter((cat) => events.some((ev) => ev.category === cat)).map((cat) => (
            <button key={cat} type="button" onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === cat ? "bg-amber-300 text-black" : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}>
              {CATEGORY_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Event cards ── */}
      <section className="grid gap-6">
        {loading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">
            {query ? `No events match "${query}"` : filter !== "ALL" ? `No ${filter} events found.` : "No events yet."}
          </div>
        ) : (
          filtered.map((event) => <EventCard key={event._id} event={event} onRefresh={fetchEvents} />)
        )}
      </section>
    </div>
  );
}