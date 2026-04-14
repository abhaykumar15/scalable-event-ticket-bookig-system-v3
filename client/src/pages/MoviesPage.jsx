import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import api from "../api/client";
import Carousel from "../components/Carousel";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "", description: "", genre: "", language: "",
  durationMinutes: 150, posterUrl: "", rating: 4.5,
  theatreName: "", city: "", screenName: "Screen 1",
  startTime: "", price: 250, totalSeats: 40,
};

export default function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies]         = useState([]);
  const [form, setForm]             = useState(emptyForm);
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

  const createMovie = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/movies", {
        title: form.title, description: form.description,
        genre: form.genre, language: form.language,
        durationMinutes: Number(form.durationMinutes),
        posterUrl: form.posterUrl, rating: Number(form.rating),
        shows: [{
          theatreName: form.theatreName, city: form.city,
          screenName: form.screenName, startTime: form.startTime,
          price: Number(form.price), totalSeats: Number(form.totalSeats),
        }],
      });
      setForm(emptyForm);
      await fetchMovies();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create movie.");
    } finally {
      setSubmitting(false);
    }
  };
  // New state for "add show" form
const [addShowForm, setAddShowForm] = useState({
  movieId: "", theatreName: "", city: "", screenName: "Screen 1",
  date: "", startTime: "", price: 250, totalSeats: 40,
});

const addShow = async (e) => {
  e.preventDefault();
  try {
    await api.post(`/movies/${addShowForm.movieId}/shows`, {
      theatreName: addShowForm.theatreName,
      city: addShowForm.city,
      screenName: addShowForm.screenName,
      date: addShowForm.date,
      startTime: addShowForm.startTime,
      price: Number(addShowForm.price),
      totalSeats: Number(addShowForm.totalSeats),
    });
    await fetchMovies();
  } catch (e) {
    setError(e.response?.data?.message || "Unable to add show.");
  }
};


  // Top-rated movies for the carousel (top 6 by rating)
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
            <h2 className="title-font mt-3 text-3xl font-semibold">Publish a movie and its first show</h2>
          </div>
          <form onSubmit={createMovie} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(form).map(([key, value]) => (
              <input
                key={key}
                type={key.toLowerCase().includes("time") ? "datetime-local" : key === "posterUrl" ? "url" : typeof value === "number" ? "number" : "text"}
                placeholder={key}
                value={value}
                onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                className={`rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50 ${key === "description" ? "xl:col-span-3" : ""}`}
              />
            ))}
            <button type="submit" disabled={submitting} className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60">
              {submitting ? "Publishing..." : "Create movie"}
            </button>
          </form>
        </motion.section>
      )}

      {error && <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">{error}</p>}

      {/* ── Movie list ── */}
      <section className="grid gap-6">
        {loading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">Loading movies...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">
            {query ? `No movies match "${query}"` : "No movies yet. Create one as an admin to start."}
          </div>
        ) : (
          // Change this line in the movie list section:
          filtered.map((movie) => <MovieCard key={movie._id} movie={movie} onRefresh={fetchMovies} />)
        )}
      </section>
    </div>
  );
}
