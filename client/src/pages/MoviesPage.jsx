import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import api from "../api/client";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  genre: "",
  language: "",
  durationMinutes: 150,
  posterUrl: "",
  rating: 4.5,
  theatreName: "",
  city: "",
  screenName: "Screen 1",
  startTime: "",
  price: 250,
  totalSeats: 40
};

function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/movies");
      setMovies(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const createMovie = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/movies", {
        title: form.title,
        description: form.description,
        genre: form.genre,
        language: form.language,
        durationMinutes: Number(form.durationMinutes),
        posterUrl: form.posterUrl,
        rating: Number(form.rating),
        shows: [
          {
            theatreName: form.theatreName,
            city: form.city,
            screenName: form.screenName,
            startTime: form.startTime,
            price: Number(form.price),
            totalSeats: Number(form.totalSeats)
          }
        ]
      });

      setForm(emptyForm);
      await fetchMovies();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create movie.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden rounded-[2rem] p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/70">Discovery</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="title-font text-4xl font-semibold sm:text-5xl">
              Browse shows, reserve seats, watch Movies and chill.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/65">
              look for movies,events and more.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Signed in as</p>
            <p className="mt-2 title-font text-2xl font-semibold">{user?.role}</p>
          </div>
        </div>
      </motion.section>

      {user?.role === "admin" ? (
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
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className={`rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50 ${key === "description" ? "xl:col-span-3" : ""}`}
              />
            ))}
            <button type="submit" disabled={submitting} className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60">
              {submitting ? "Publishing..." : "Create movie"}
            </button>
          </form>
        </motion.section>
      ) : null}

      {error ? <p className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">{error}</p> : null}

      <section className="grid gap-6">
        {loading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-white/60">
            No movies yet. Create one as an admin to start the booking flow.
          </div>
        ) : (
          movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)
        )}
      </section>
    </div>
  );
}

export default MoviesPage;
