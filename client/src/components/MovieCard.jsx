import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  // Build sorted unique dates from all shows
  const dates = useMemo(() => {
    const unique = [...new Set(movie.shows.map((s) => s.date))].sort();
    return unique;
  }, [movie.shows]);

  const [selectedDate, setSelectedDate] = useState(dates[0] || null);

  // Shows for the selected date
  const showsForDate = useMemo(
    () => movie.shows.filter((s) => s.date === selectedDate),
    [movie.shows, selectedDate]
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day:     d.toLocaleDateString("en-IN", { weekday: "short" }),
      date:    d.getDate(),
      month:   d.toLocaleDateString("en-IN", { month: "short" }),
    };
  };

  const formatTime = (startTime) =>
    new Date(startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-3xl shadow-glow"
    >
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full min-h-72 w-full object-cover"
        />

        <div className="flex flex-col gap-6 p-6">
          {/* Movie info */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                {movie.language} · {movie.genre}
              </p>
              <h3 className="title-font text-3xl font-semibold">{movie.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{movie.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Runtime</p>
              <p className="mt-1 text-lg font-semibold">{movie.durationMinutes} min</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">
                Rating {movie.rating}/5
              </p>
            </div>
          </div>

          {/* Date tabs — BookMyShow style */}
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
                    className={[
                      "flex min-w-[60px] flex-col items-center rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-amber-300 bg-amber-300 text-black"
                        : "border-white/10 bg-white/5 text-white hover:border-amber-200/50 hover:bg-white/10",
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

          {/* Time slots for selected date */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">
              Available Shows · {selectedDate}
            </p>
            {showsForDate.length === 0 ? (
              <p className="text-sm text-white/40">No shows for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {showsForDate.map((show) => (
                  <div
                    key={show._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 min-w-[160px]"
                  >
                    <p className="text-lg font-bold text-amber-200">{formatTime(show.startTime)}</p>
                    <p className="mt-1 text-xs text-white/60">{show.theatreName}</p>
                    <p className="text-xs text-white/50">{show.city} · {show.screenName}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">₹{show.price}</span>
                      <Link
                        to={`/movies/${movie._id}/shows/${show._id}/book`}
                        className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-200"
                      >
                        Book →
                      </Link>
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