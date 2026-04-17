import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import api from "../api/client";
import Carousel from "../components/Carousel";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";

const emptyMovieForm = {
  title: "", description: "", genre: "", language: "",
  durationMinutes: 150, posterUrl: "", rating: 4.5,
};

const emptyShow = {
  theatreName: "", city: "", screenName: "Screen 1",
  date: "", startTime: "", price: 250, totalSeats: 40,
};

export default function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies]         = useState([]);
  const [form, setForm]             = useState(emptyMovieForm);
  const [shows, setShows]           = useState([{ ...emptyShow }]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [query, setQuery]           = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/movies");
      setMovies(res.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  // Show row helpers
  const addShow = () => setShows((s) => [...s, { ...emptyShow }]);
  const removeShow = (i) => setShows((s) => s.filter((_, idx) => idx !== i));
  const updateShow = (i, key, val) =>
    setShows((s) => s.map((sh, idx) => idx === i ? { ...sh, [key]: val } : sh));

  const createMovie = async (e) => {
    e.preventDefault();
    if (shows.some((s) => !s.theatreName || !s.city || !s.date || !s.startTime || !s.price)) {
      setError("Please fill all required fields for every show.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/movies", {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        rating: Number(form.rating),
        shows: shows.map((s) => ({
          theatreName: s.theatreName,
          city:        s.city,
          screenName:  s.screenName || "Screen 1",
          date:        s.date,
          startTime:   s.startTime,
          price:       Number(s.price),
          totalSeats:  Number(s.totalSeats),
        })),
      });
      setForm(emptyMovieForm);
      setShows([{ ...emptyShow }]);
      await fetchMovies();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create movie.");
    } finally {
      setSubmitting(false);
    }
  };

  const featured = useMemo(
    () => [...movies].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [movies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [movies, query]);

  return (
    <div className="page-shell">

      {/* ── Carousel ── */}
      {loading ? (
        <div className="flex h-[380px] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
        </div>
      ) : featured.length > 0 ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/50">Popular Right Now</p>
          <Carousel items={featured} mode="movies" />
        </div>
      ) : null}

      {/* ── Hero / Search ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-[2rem] p-8"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/70">Discovery</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="title-font text-3xl font-semibold sm:text-4xl">
              Browse shows, reserve seats, watch Movies and chill.
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/55">
              Search by title, genre, or language to find your next watch.
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
            placeholder="Search by title, genre, language…"
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
              ? `No movies match "${query}"`
              : `${filtered.length} movie${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        )}
      </motion.section>

      {/* ── Admin panel ── */}
      {user?.role === "admin" && (
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Admin Panel</p>
            <h2 className="title-font mt-3 text-3xl font-semibold">Publish a Movie</h2>
            <p className="mt-1 text-sm text-white/50">Fill movie details, then add one or more shows across any dates.</p>
          </div>

          <form onSubmit={createMovie} className="flex flex-col gap-8">

            {/* ── Movie details ── */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-amber-200/60">🎬 Movie Details</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <input required type="text"   placeholder="Title"           value={form.title}           onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}           className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="text"   placeholder="Genre"           value={form.genre}           onChange={(e) => setForm((c) => ({ ...c, genre: e.target.value }))}           className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="text"   placeholder="Language"        value={form.language}        onChange={(e) => setForm((c) => ({ ...c, language: e.target.value }))}        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input required type="number" placeholder="Duration (min)"  value={form.durationMinutes} onChange={(e) => setForm((c) => ({ ...c, durationMinutes: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <input          type="number" placeholder="Rating (0–5)"    value={form.rating}          onChange={(e) => setForm((c) => ({ ...c, rating: e.target.value }))}          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" step="0.1" min="0" max="5" />
                <input          type="url"    placeholder="Poster URL"       value={form.posterUrl}       onChange={(e) => setForm((c) => ({ ...c, posterUrl: e.target.value }))}       className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50" />
                <textarea required placeholder="Description" value={form.description} rows={2}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  className="xl:col-span-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300/50 resize-none"
                />
              </div>
            </div>

            {/* ── Shows ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/60">🎟️ Shows ({shows.length})</p>
                <button
                  type="button"
                  onClick={addShow}
                  className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/20"
                >
                  + Add Show
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {shows.map((show, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold text-white/60">Show #{i + 1}</p>
                      {shows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeShow(i)}
                          className="rounded-lg border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-300 hover:bg-red-400/20"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <input required type="text"           placeholder="Theatre Name"   value={show.theatreName} onChange={(e) => updateShow(i, "theatreName", e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="text"           placeholder="City"           value={show.city}        onChange={(e) => updateShow(i, "city",        e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input          type="text"           placeholder="Screen Name"    value={show.screenName}  onChange={(e) => updateShow(i, "screenName",  e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="date"           placeholder="Date"           value={show.date}        onChange={(e) => updateShow(i, "date",        e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="datetime-local" placeholder="Start Time"     value={show.startTime}   onChange={(e) => updateShow(i, "startTime",   e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" />
                      <input required type="number"         placeholder="Price (₹)"      value={show.price}       onChange={(e) => updateShow(i, "price",       e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" min="0" />
                      <input required type="number"         placeholder="Total Seats"    value={show.totalSeats}  onChange={(e) => updateShow(i, "totalSeats",  e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300/50" min="1" />
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
              {submitting ? "Publishing..." : `Publish Movie with ${shows.length} Show${shows.length > 1 ? "s" : ""}`}
            </button>
          </form>
        </motion.section>
      )}

      {/* ── Movie list ── */}
      <section className="grid gap-6">
        {loading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">Loading movies...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">
            {query ? `No movies match "${query}"` : "No movies yet. Create one as an admin to start."}
          </div>
        ) : (
          filtered.map((movie) => <MovieCard key={movie._id} movie={movie} onRefresh={fetchMovies} />)
        )}
      </section>
    </div>
  );
}