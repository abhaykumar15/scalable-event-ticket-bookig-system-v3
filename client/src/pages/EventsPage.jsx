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

const emptyForm = {
  title: "", description: "", category: "Concert", artist: "", language: "",
  durationMinutes: 90, posterUrl: "", rating: 4.5,
  venueName: "", city: "", section: "General", startTime: "", price: 599, totalSeats: 60,
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents]         = useState([]);
  const [form, setForm]             = useState(emptyForm);
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

  const createEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/events", {
        title: form.title, description: form.description, category: form.category,
        artist: form.artist, language: form.language,
        durationMinutes: Number(form.durationMinutes),
        posterUrl: form.posterUrl, rating: Number(form.rating),
        slots: [{
          venueName: form.venueName, city: form.city, section: form.section,
          startTime: form.startTime, price: Number(form.price), totalSeats: Number(form.totalSeats),
        }],
      });
      setForm(emptyForm);
      await fetchEvents();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  // Top-rated events for the carousel (top 6 by rating)
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
            <h2 className="title-font mt-3 text-3xl font-semibold">Publish an event</h2>
          </div>
          <form onSubmit={createEvent} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50">
              {CATEGORIES.map((cat) => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
            </select>
            {[
              ["title","text"],["artist","text"],["language","text"],
              ["durationMinutes","number"],["posterUrl","url"],["rating","number"],
              ["venueName","text"],["city","text"],["section","text"],
              ["startTime","datetime-local"],["price","number"],["totalSeats","number"],
            ].map(([key, type]) => (
              <input key={key} type={type} placeholder={key} value={form[key]}
                onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50" />
            ))}
            <textarea placeholder="description" value={form.description} rows={2}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50 xl:col-span-3" />
            <button type="submit" disabled={submitting} className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60">
              {submitting ? "Publishing..." : "Create event"}
            </button>
          </form>
        </motion.section>
      )}

      {error && <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">{error}</p>}

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
          filtered.map((event) => <EventCard key={event._id} event={event} />)
        )}
      </section>
    </div>
  );
}
