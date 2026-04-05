import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                {movie.language} · {movie.genre}
              </p>
              <h3 className="title-font text-3xl font-semibold">{movie.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {movie.description}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Runtime</p>
              <p className="mt-1 text-lg font-semibold">{movie.durationMinutes} min</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">
                Rating {movie.rating}/5
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {movie.shows.map((show) => (
              <div
                key={show._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-amber-100">{show.theatreName}</p>
                <p className="mt-1 text-sm text-white/60">
                  {show.city} · {show.screenName}
                </p>
                <p className="mt-3 text-sm text-white/80">
                  {new Date(show.startTime).toLocaleString()}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Price</p>
                    <p className="text-lg font-semibold text-amber-200">Rs {show.price}</p>
                  </div>
                  <Link
                    to={`/movies/${movie._id}/shows/${show._id}/book`}
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

export default MovieCard;
