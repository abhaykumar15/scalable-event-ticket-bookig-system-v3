import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/client";

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    title: "Processing your payment…",
    subtitle: "This usually takes just a few seconds.",
    icon: "⏳",
    accent: "text-amber-200",
    border: "border-amber-400/30",
    bg: "bg-amber-400/5",
  },
  PAYMENT_SUCCESS: {
    title: "Booking Confirmed!",
    subtitle: "Your seats are locked in. Enjoy the show!",
    icon: "🎉",
    accent: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/5",
  },
  PAYMENT_FAILED: {
    title: "Payment Failed",
    subtitle: "All retry attempts were exhausted. Please try booking again.",
    icon: "❌",
    accent: "text-red-300",
    border: "border-red-400/30",
    bg: "bg-red-400/5",
  },
};

export default function PaymentStatusPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    let timeoutId;
    const loadBooking = async () => {
      try {
        const res = await api.get(`/booking/bookings/${bookingId}`);
        setBooking(res.data);
        setError("");
        if (res.data.status === "PENDING_PAYMENT") {
          timeoutId = setTimeout(loadBooking, 3000);
        }
      } catch (e) {
        setError(e.response?.data?.message || "Unable to fetch booking status.");
      }
    };
    loadBooking();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [bookingId]);

  const config = booking ? STATUS_CONFIG[booking.status] : null;

  return (
    <div className="page-shell">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl"
      >
        {/* Status banner */}
        <AnimatePresence mode="wait">
          {config && (
            <motion.div
              key={booking.status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[2rem] border ${config.border} ${config.bg} p-8 text-center mb-6`}
            >
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-5xl mb-4"
              >
                {config.icon}
              </motion.p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-2">Payment Status</p>
              <h1 className={`title-font text-3xl font-semibold ${config.accent}`}>
                {config.title}
              </h1>
              <p className="mt-2 text-sm text-white/55">{config.subtitle}</p>

              {booking.status === "PENDING_PAYMENT" && (
                <div className="mt-4 flex justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!booking && !error && (
          <div className="glass-panel rounded-[2rem] p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            </div>
            <p className="text-white/50">Loading booking details…</p>
          </div>
        )}

        {error && (
          <div className="glass-panel rounded-[2rem] p-8 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Booking details */}
        {booking && (
          <div className="glass-panel rounded-[2rem] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70 mb-6">Booking Details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Title</p>
                <p className="mt-2 text-xl font-semibold">{booking.movieTitle}</p>
                <p className="mt-2 text-sm text-white/55">
                  {new Date(booking.showStartTime).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}
                  {new Date(booking.showStartTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Status</p>
                <p className={`mt-2 text-xl font-semibold ${config?.accent}`}>
                  {booking.status.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  {booking.paymentAttempts ?? 0} attempt{(booking.paymentAttempts ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Seats</p>
                <p className="mt-2 text-lg font-semibold">{booking.seatNumbers.join(", ")}</p>
                <p className="mt-2 text-sm text-white/55">{booking.seatNumbers.length} seat{booking.seatNumbers.length !== 1 ? "s" : ""}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Amount Paid</p>
                <p className="mt-2 text-2xl font-bold text-amber-200">₹{booking.amount}</p>
                <p className="mt-2 text-sm text-white/55">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/movies"
                className="rounded-full bg-amber-300 px-5 py-2.5 font-semibold text-black transition hover:bg-amber-200"
              >
                Browse Movies
              </Link>
              <Link
                to="/events"
                className="rounded-full border border-white/10 px-5 py-2.5 font-semibold text-white/70 transition hover:bg-white/10"
              >
                Browse Events
              </Link>
              <Link
                to="/profile"
                className="rounded-full border border-white/10 px-5 py-2.5 font-semibold text-white/70 transition hover:bg-white/10"
              >
                My Bookings
              </Link>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}
