import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Pending",
    badge: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    dot: "bg-amber-400",
  },
  PAYMENT_SUCCESS: {
    label: "Confirmed",
    badge: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  PAYMENT_FAILED: {
    label: "Failed",
    badge: "bg-red-400/15 text-red-300 border-red-400/30",
    dot: "bg-red-400",
  },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent = "" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

// ── Booking Card ───────────────────────────────────────────────────────────
function BookingCard({ booking, movieMap, index }) {
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING_PAYMENT;
  const movie = movieMap[booking.movieId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition hover:border-white/20 hover:bg-black/30"
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${config.dot}`} />

      <div className="flex flex-col gap-0 sm:flex-row">
        {/* Poster thumbnail */}
        {movie?.posterUrl && (
          <div className="ml-1 hidden w-20 flex-shrink-0 overflow-hidden sm:block">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        <div className="ml-2 flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-tight">{booking.movieTitle}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </span>
            </div>

            {/* Movie metadata from /movies API */}
            {movie && (
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-xs text-amber-200/60">{movie.genre}</span>
                <span className="text-xs text-white/30">·</span>
                <span className="text-xs text-white/40">{movie.language}</span>
                <span className="text-xs text-white/30">·</span>
                <span className="text-xs text-white/40">{movie.durationMinutes} min</span>
                <span className="text-xs text-white/30">·</span>
                <span className="text-xs text-white/40">⭐ {movie.rating}/5</span>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
              <span>🎬 {fmtDate(booking.showStartTime)} at {fmtTime(booking.showStartTime)}</span>
              <span>💺 {booking.seatNumbers.join(", ")}</span>
            </div>
            <p className="mt-1 text-xs text-white/35">Booked {fmtDate(booking.createdAt)}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-lg font-semibold text-amber-200">₹{booking.amount}</p>
            <Link
              to={`/payment-status/${booking._id}`}
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition hover:border-amber-300/40 hover:text-amber-200"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    api.get("/booking/bookings")
      .then((r) => setBookings(r.data))
      .catch((e) => setError(e.response?.data?.message || "Unable to load bookings."))
      .finally(() => setLoadingBookings(false));
  }, []);

  const movieMap = {};
  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "PAYMENT_SUCCESS").length,
    spent: bookings.filter((b) => b.status === "PAYMENT_SUCCESS").reduce((s, b) => s + b.amount, 0),
    seats: bookings.filter((b) => b.status === "PAYMENT_SUCCESS").reduce((s, b) => s + b.seatNumbers.length, 0),
  };

  const filterOptions = [
    { value: "ALL", label: "All" },
    { value: "PAYMENT_SUCCESS", label: "Confirmed" },
    { value: "PENDING_PAYMENT", label: "Pending" },
    { value: "PAYMENT_FAILED", label: "Failed" },
  ];

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-4xl space-y-8">

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </motion.div>

        {/* Profile header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[2rem] p-8"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">My Account</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="title-font text-4xl font-semibold">{user?.name}</h1>
              <p className="mt-1 text-sm text-white/50">{user?.email}</p>
            </div>
            <span className="self-start rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-sm uppercase tracking-widest text-amber-200">
              {user?.role}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Bookings" value={stats.total} />
            <StatCard label="Confirmed" value={stats.confirmed} accent="text-emerald-300" />
            <StatCard label="Total Spent" value={`₹${stats.spent}`} accent="text-amber-200" />
            <StatCard label="Seats Booked" value={stats.seats} />
          </div>
        </motion.section>

        {/* Booking history */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-[2rem] p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Booking History</p>
              <h2 className="title-font mt-1 text-2xl font-semibold">Your Tickets</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilter(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filter === opt.value
                      ? "bg-amber-300 text-black"
                      : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loadingBookings && (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {!loadingBookings && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl">🎟️</p>
                <p className="mt-3 text-lg font-medium text-white/60">No bookings found</p>
                {filter !== "ALL" ? (
                  <button
                    type="button"
                    onClick={() => setFilter("ALL")}
                    className="mt-3 text-sm text-amber-200/70 hover:text-amber-200"
                  >
                    Clear filter
                  </button>
                ) : (
                  <Link to="/movies" className="mt-3 text-sm text-amber-200/70 hover:text-amber-200">
                    Browse movies →
                  </Link>
                )}
              </div>
            )}

            <AnimatePresence>
              {filtered.map((booking, i) => (
                <BookingCard key={booking._id} booking={booking} movieMap={movieMap} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
