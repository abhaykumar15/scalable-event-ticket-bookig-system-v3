import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/client";

function PaymentStatusPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timeoutId;

    const loadBooking = async () => {
      try {
        const response = await api.get(`/booking/bookings/${bookingId}`);
        setBooking(response.data);
        setError("");

        if (response.data.status === "PENDING_PAYMENT") {
          timeoutId = setTimeout(loadBooking, 3000);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to fetch booking status.");
      }
    };

    loadBooking();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bookingId]);

  const statusCopy = {
    PENDING_PAYMENT: {
      title: "Payment is being processed",
      accent: "text-amber-200"
    },
    PAYMENT_SUCCESS: {
      title: "Payment confirmed",
      accent: "text-emerald-300"
    },
    PAYMENT_FAILED: {
      title: "Payment failed after retries",
      accent: "text-red-300"
    }
  };

  const currentStatus = booking ? statusCopy[booking.status] : null;

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mx-auto w-full max-w-3xl rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Payment Status</p>
        <h1 className="title-font mt-3 text-4xl font-semibold">
          {currentStatus?.title || "Loading booking"}
        </h1>

        {error ? <p className="mt-4 text-red-300">{error}</p> : null}

        {booking ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Movie</p>
              <p className="mt-2 text-2xl font-semibold">{booking.movieTitle}</p>
              <p className="mt-3 text-sm text-white/60">{new Date(booking.showStartTime).toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Booking status</p>
              <p className={`mt-2 text-2xl font-semibold ${currentStatus?.accent || ""}`}>{booking.status}</p>
              <p className="mt-3 text-sm text-white/60">Attempts: {booking.paymentAttempts ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Seats</p>
              <p className="mt-2 text-xl font-semibold">{booking.seatNumbers.join(", ")}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Amount</p>
              <p className="mt-2 text-xl font-semibold text-amber-200">Rs {booking.amount}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/movies" className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-black transition hover:bg-amber-200">
            Back to movies
          </Link>
          <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/10">
            Refresh status
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default PaymentStatusPage;
