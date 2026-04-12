import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";
import Carousel from "../components/Carousel";
import { useAuth } from "../context/AuthContext";

const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤", "Concert": "🎵", "Theatre": "🎭",
  "Festival": "🎪", "Sports": "🏟️", "Conference": "🧠", "Other": "✨",
};

// stagger helper
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45 },
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/movies"), api.get("/events")])
      .then(([mRes, eRes]) => {
        setMovies(mRes.data);
        setEvents(eRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Top 6 by rating for each carousel
  const featuredMovies = useMemo(
    () => [...movies].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [movies]
  );
  const featuredEvents = useMemo(
    () => [...events].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [events]
  );

  // Recent 4 of each for the quick-browse strips
  const recentMovies = movies.slice(0, 4);
  const recentEvents = events.slice(0, 4);

  const CarouselSkeleton = () => (
    <div className="flex h-[400px] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
    </div>
  );

  return (
    <div className="page-shell">

      {/* ── Welcome banner ── */}
      <motion.section {...fadeUp(0)} className="glass-panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">{greeting()}</p>
        <h1 className="title-font mt-2 text-4xl font-semibold sm:text-5xl">
          Welcome back, <span className="text-amber-200">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/55 max-w-xl">
          Ready to book your next experience? Browse the latest movies and live events, grab your seats, and make memories.
        </p>

        {/* Stat chips */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
            🎬 <span className="text-white font-medium">{movies.length}</span> movies available
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
            🎪 <span className="text-white font-medium">{events.length}</span> events available
          </div>
          <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200/80">
            {user?.role === "admin" ? "👑 Admin" : "🎟️ Member"}
          </div>
        </div>
      </motion.section>

      {/* ── Quick navigation cards ── */}
      <motion.div {...fadeUp(0.08)} className="grid gap-4 sm:grid-cols-2">
        <Link to="/movies" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-amber-300/30 hover:bg-white/8">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="title-font text-2xl font-semibold">Movies</h2>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            Blockbusters, indie films, regional cinema — browse all shows and book your seats instantly.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition group-hover:bg-amber-200">
            Browse Movies →
          </div>
          {/* decorative blob */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/5 transition group-hover:bg-amber-300/10" />
        </Link>

        <Link to="/events" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-amber-300/30 hover:bg-white/8">
          <div className="text-4xl mb-4">🎪</div>
          <h2 className="title-font text-2xl font-semibold">Events</h2>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            Concerts, stand-up comedy, theatre, sports — find live experiences near you and book today.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition group-hover:bg-amber-200">
            Browse Events →
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/5 transition group-hover:bg-amber-300/10" />
        </Link>
      </motion.div>

      {/* ── Movies carousel ── */}
      <motion.div {...fadeUp(0.15)}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">Popular Movies</p>
          <Link to="/movies" className="text-xs text-white/40 hover:text-amber-200 transition">See all →</Link>
        </div>
        {loading ? <CarouselSkeleton /> : featuredMovies.length > 0
          ? <Carousel items={featuredMovies} mode="movies" />
          : <div className="flex h-32 items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 text-sm text-white/40">No movies yet</div>
        }
      </motion.div>

      {/* ── Events carousel ── */}
      <motion.div {...fadeUp(0.22)}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">Trending Events</p>
          <Link to="/events" className="text-xs text-white/40 hover:text-amber-200 transition">See all →</Link>
        </div>
        {loading ? <CarouselSkeleton /> : featuredEvents.length > 0
          ? <Carousel items={featuredEvents} mode="events" />
          : <div className="flex h-32 items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 text-sm text-white/40">No events yet</div>
        }
      </motion.div>

      {/* ── Popular Right Now (Movies) ── */}
      <motion.div {...fadeUp(0.28)}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">🔥 Popular Right Now</p>
          <Link to="/movies" className="text-xs text-white/40 hover:text-amber-200 transition">See all →</Link>
        </div>
        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-[2rem] border border-white/10 bg-black/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
          </div>
        ) : featuredMovies.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMovies.slice(0, 6).map((m, i) => (
              <Link
                key={m._id}
                to={m.shows?.length > 0 ? `/movies/${m._id}/shows/${m.shows[0]._id}/book` : "/movies"}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-amber-300/30 hover:bg-white/8"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 rounded-full border border-amber-300/30 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-200 backdrop-blur-sm">
                    #{i + 1}
                  </div>
                  {m.shows?.length > 0 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-black">
                      ₹{m.shows[0].price}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-white/45 mt-0.5">{m.genre} · ⭐ {m.rating}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 text-sm text-white/40">No movies yet</div>
        )}
      </motion.div>

      {/* ── Quick browse strips ── */}
      {!loading && (recentMovies.length > 0 || recentEvents.length > 0) && (
        <motion.div {...fadeUp(0.35)} className="grid gap-8 lg:grid-cols-2">

          {/* Movies strip */}
          {recentMovies.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">🎬 Latest Movies</p>
                <Link to="/movies" className="text-xs text-white/40 hover:text-amber-200 transition">View all</Link>
              </div>
              <div className="space-y-2">
                {recentMovies.map((m) => (
                  <Link
                    key={m._id}
                    to={m.shows?.length > 0 ? `/movies/${m._id}/shows/${m.shows[0]._id}/book` : "/movies"}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/8"
                  >
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="h-12 w-10 flex-shrink-0 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-white/45">{m.genre} · {m.language} · ⭐ {m.rating}</p>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-amber-200">
                      {m.shows?.length > 0 ? `₹${m.shows[0].price}` : "—"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events strip */}
          {recentEvents.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">🎪 Latest Events</p>
                <Link to="/events" className="text-xs text-white/40 hover:text-amber-200 transition">View all</Link>
              </div>
              <div className="space-y-2">
                {recentEvents.map((ev) => (
                  <Link
                    key={ev._id}
                    to={ev.slots?.length > 0 ? `/events/${ev._id}/slots/${ev.slots[0]._id}/book` : "/events"}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/8"
                  >
                    <div className="flex h-12 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-xl">
                      {CATEGORY_EMOJI[ev.category] || "✨"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ev.title}</p>
                      <p className="truncate text-xs text-white/45">{ev.artist} · ⭐ {ev.rating}</p>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-amber-200">
                      {ev.slots?.length > 0 ? `₹${ev.slots[0].price}` : "—"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Profile shortcut ── */}
      <motion.div {...fadeUp(0.40)}>
        <Link
          to="/profile"
          className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-7 py-5 transition hover:border-amber-300/30 hover:bg-white/8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300/15 text-xl">
              🎟️
            </div>
            <div>
              <p className="font-semibold">My Bookings</p>
              <p className="text-sm text-white/50">View your booking history and ticket status</p>
            </div>
          </div>
          <span className="text-white/30 transition group-hover:text-amber-200 group-hover:translate-x-1">→</span>
        </Link>
      </motion.div>

    </div>
  );
}
