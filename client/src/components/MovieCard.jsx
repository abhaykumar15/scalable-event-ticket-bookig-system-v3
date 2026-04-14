import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function MovieCard({ movie, onRefresh }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [editing, setEditing]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: movie.title, description: movie.description,
    genre: movie.genre, language: movie.language,
    durationMinutes: movie.durationMinutes, rating: movie.rating,
    posterUrl: movie.posterUrl,
  });

  const dates = useMemo(() => [...new Set(movie.shows.map((s) => s.date))].sort(), [movie.shows]);
  const [selectedDate, setSelectedDate] = useState(dates[0] || null);
  const showsForDate = useMemo(() => movie.shows.filter((s) => s.date === selectedDate), [movie.shows, selectedDate]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day:   d.toLocaleDateString("en-IN", { weekday: "short" }),
      date:  d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  };

  const formatTime = (startTime) =>
    new Date(startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/movies/${movie._id}`);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete movie.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/movies/${movie._id}`, editForm);
      setEditing(false);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to update movie.");
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm("Delete this show?")) return;
    try {
      await api.delete(`/movies/${movie._id}/shows/${showId}`);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete show.");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-3xl shadow-glow"
    >
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <img src={movie.posterUrl} alt={movie.title} className="h-full min-h-72 w-full object-cover" />

        <div className="flex flex-col gap-6 p-6">
          {/* Movie info + admin actions */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                {movie.language} · {movie.genre}
              </p>
              <h3 className="title-font text-3xl font-semibold">{movie.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{movie.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Runtime</p>
                <p className="mt-1 text-lg font-semibold">{movie.durationMinutes} min</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">Rating {movie.rating}/5</p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-amber-300/50 hover:bg-white/10"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-60"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Edit form — shown inline when editing */}
          {editing && (
            <form onSubmit={handleUpdate} className="rounded-2xl border border-amber-300/20 bg-black/20 p-5 grid gap-3 md:grid-cols-2">
              <p className="md:col-span-2 text-xs uppercase tracking-[0.25em] text-amber-200/70 mb-1">Edit Movie Details</p>
              {[
                { key: "title",           label: "Title" },
                { key: "genre",           label: "Genre" },
                { key: "language",        label: "Language" },
                { key: "durationMinutes", label: "Duration (min)", type: "number" },
                { key: "rating",          label: "Rating",         type: "number" },
                { key: "posterUrl",       label: "Poster URL",     span: true },
                { key: "description",     label: "Description",    span: true },
              ].map(({ key, label, type = "text", span }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={label}
                  value={editForm[key]}
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

          {/* Date tabs */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">Select Date</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map((dateStr) => {
                const { day, date, month } = formatDate(dateStr);
                const isActive = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={["flex min-w-[60px] flex-col items-center rounded-2xl border px-4 py-3 transition",
                      isActive ? "border-amber-300 bg-amber-300 text-black" : "border-white/10 bg-white/5 text-white hover:border-amber-200/50 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <span className="text-xs font-medium">{day}</span>
                    <span className="text-xl font-bold leading-tight">{date}</span>
                    <span className="text-xs">{month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">Available Shows · {selectedDate}</p>
            {showsForDate.length === 0 ? (
              <p className="text-sm text-white/40">No shows for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {showsForDate.map((show) => (
                  <div key={show._id} className="rounded-2xl border border-white/10 bg-white/5 p-4 min-w-[160px]">
                    <p className="text-lg font-bold text-amber-200">{formatTime(show.startTime)}</p>
                    <p className="mt-1 text-xs text-white/60">{show.theatreName}</p>
                    <p className="text-xs text-white/50">{show.city} · {show.screenName}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">₹{show.price}</span>
                      <div className="flex gap-1 items-center">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteShow(show._id)}
                            className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-300 hover:bg-red-400/20"
                          >
                            🗑️
                          </button>
                        )}
                        <Link
                          to={`/movies/${movie._id}/shows/${show._id}/book`}
                          className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-200"
                        >
                          Book →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default MovieCard;