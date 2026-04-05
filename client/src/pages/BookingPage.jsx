import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import SeatGrid from "../components/SeatGrid";

function BookingPage() {
  const { movieId, showId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [seatState, setSeatState] = useState({ bookedSeats: [], lockedSeats: [] });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const show = useMemo(() => movie?.shows?.find((item) => item._id === showId), [movie, showId]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [movieResponse, seatResponse] = await Promise.all([
        api.get(`/movies/${movieId}`),
        api.get(`/booking/seats/status/${showId}`)
      ]);

      setMovie(movieResponse.data);
      setSeatState(seatResponse.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [movieId, showId]);

  const toggleSeat = (seatLabel) => {
    setSelectedSeats((current) =>
      current.includes(seatLabel)
        ? current.filter((seat) => seat !== seatLabel)
        : [...current, seatLabel]
    );
  };

  const createBooking = async () => {
    if (!show || selectedSeats.length === 0) {
      setError("Select at least one seat.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/booking/seats/lock", {
        showId,
        seatNumbers: selectedSeats
      });

      const bookingResponse = await api.post("/booking/bookings", {
        movieId,
        movieTitle: movie.title,
        showId,
        showStartTime: show.startTime,
        amount: show.price * selectedSeats.length,
        seatNumbers: selectedSeats
      });

      navigate(`/payment-status/${bookingResponse.data._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create booking.");
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-shell text-center text-white/60">Loading seat map...</div>;
  }

  if (!movie || !show) {
    return <div className="page-shell text-center text-white/60">Show not found.</div>;
  }

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SeatGrid totalSeats={show.totalSeats} bookedSeats={seatState.bookedSeats} lockedSeats={seatState.lockedSeats} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />

        <div className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Booking</p>
          <h1 className="title-font mt-3 text-3xl font-semibold">{movie.title}</h1>
          <p className="mt-3 text-sm text-white/65">
            {show.theatreName} · {show.city} · {show.screenName}
          </p>
          <p className="mt-2 text-sm text-white/80">{new Date(show.startTime).toLocaleString()}</p>

          <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Selected seats</span>
              <span>{selectedSeats.length ? selectedSeats.join(", ") : "None"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Ticket price</span>
              <span>Rs {show.price}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-amber-200">Rs {show.price * selectedSeats.length}</span>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          <button type="button" disabled={submitting || selectedSeats.length === 0} onClick={createBooking} className="mt-6 w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60">
            {submitting ? "Creating booking..." : "Lock and create booking"}
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default BookingPage;
