import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import SeatGrid from "../components/SeatGrid";

function BookingPage() {
  const { movieId, showId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie]                   = useState(null);
  const [seatState, setSeatState]           = useState({ bookedSeats: [], lockedSeats: [] });
  const [selectedSeats, setSelectedSeats]   = useState([]);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);

  // active show driven by URL param, but user can switch
  const [activeShowId, setActiveShowId]     = useState(showId);

  const show = useMemo(
    () => movie?.shows?.find((s) => s._id === activeShowId),
    [movie, activeShowId]
  );

  // All unique dates for this movie
  const dates = useMemo(() => {
    if (!movie) return [];
    return [...new Set(movie.shows.map((s) => s.date))].sort();
  }, [movie]);

  const activeDate = show?.date || null;

  // Shows for the currently selected date
  const showsForActiveDate = useMemo(() => {
    if (!movie || !activeDate) return [];
    return movie.shows.filter((s) => s.date === activeDate);
  }, [movie, activeDate]);

  const loadData = async (targetShowId = activeShowId) => {
    setLoading(true);
    try {
      const [movieRes, seatRes] = await Promise.all([
        api.get(`/movies/${movieId}`),
        api.get(`/booking/seats/status/${targetShowId}`),
      ]);
      setMovie(movieRes.data);
      setSeatState(seatRes.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [movieId]);

  // When user switches show — reload seat status, clear selected seats
  const switchShow = async (newShowId) => {
    if (newShowId === activeShowId) return;
    setActiveShowId(newShowId);
    setSelectedSeats([]);
    setError("");
    setLoading(true);
    try {
      const seatRes = await api.get(`/booking/seats/status/${newShowId}`);
      setSeatState(seatRes.data);
    } catch (e) {
      setError("Unable to load seat status.");
    } finally {
      setLoading(false);
    }
    // Update URL without full reload
    navigate(`/movies/${movieId}/shows/${newShowId}/book`, { replace: true });
  };

  // When user switches date — auto-select first show of that date
  const switchDate = (dateStr) => {
    if (!movie) return;
    const firstShow = movie.shows.find((s) => s.date === dateStr);
    if (firstShow) switchShow(firstShow._id);
  };

  const toggleSeat = (label) =>
    setSelectedSeats((cur) =>
      cur.includes(label) ? cur.filter((s) => s !== label) : [...cur, label]
    );

  const proceedToPayment = async () => {
    if (!show || selectedSeats.length === 0) { setError("Select at least one seat."); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/booking/seats/lock", { showId: activeShowId, seatNumbers: selectedSeats });

      const res = await api.post("/booking/bookings", {
        movieId,
        movieTitle:    movie.title,
        showId:        activeShowId,
        showStartTime: show.startTime,
        amount:        show.price * selectedSeats.length,
        seatNumbers:   selectedSeats,
      });

      navigate(`/payment/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create booking.");
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatTime = (startTime) =>
    new Date(startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="page-shell text-center text-white/60">Loading seat map...</div>;
  if (!movie || !show) return <div className="page-shell text-center text-white/60">Show not found.</div>;

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

        {/* ── Date + Time switcher bar ── */}
        <div className="glass-panel rounded-[2rem] p-5 flex flex-col gap-4">

          {/* Date tabs */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">Date</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map((dateStr) => (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => switchDate(dateStr)}
                  className={[
                    "rounded-2xl border px-4 py-2 text-sm font-semibold transition whitespace-nowrap",
                    activeDate === dateStr
                      ? "border-amber-300 bg-amber-300 text-black"
                      : "border-white/10 bg-white/5 text-white hover:border-amber-200/50",
                  ].join(" ")}
                >
                  {formatDate(dateStr)}
                </button>
              ))}
            </div>
          </div>

          {/* Time slot tabs for active date */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">Show Time</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {showsForActiveDate.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => switchShow(s._id)}
                  className={[
                    "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                    activeShowId === s._id
                      ? "border-amber-300 bg-amber-300 text-black"
                      : "border-white/10 bg-white/5 text-white hover:border-amber-200/50",
                  ].join(" ")}
                >
                  {formatTime(s.startTime)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Seat grid + Summary ── */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SeatGrid
            totalSeats={show.totalSeats}
            bookedSeats={seatState.bookedSeats}
            lockedSeats={seatState.lockedSeats}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">🎬 Booking</p>
            <h1 className="title-font mt-3 text-3xl font-semibold">{movie.title}</h1>
            <p className="mt-3 text-sm text-white/65">
              {show.theatreName} · {show.city} · {show.screenName}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {formatDate(show.date)} · {formatTime(show.startTime)}
            </p>

            <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Selected seats</span>
                <span>{selectedSeats.length ? selectedSeats.join(", ") : "None"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Ticket price</span>
                <span>₹{show.price}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-amber-200">₹{show.price * selectedSeats.length}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

            <button
              type="button"
              disabled={submitting || selectedSeats.length === 0}
              onClick={proceedToPayment}
              className="mt-6 w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60"
            >
              {submitting ? "Locking seats…" : "Proceed to Payment →"}
            </button>
          </div>
        </div>

      </motion.section>
    </div>
  );
}

export default BookingPage;