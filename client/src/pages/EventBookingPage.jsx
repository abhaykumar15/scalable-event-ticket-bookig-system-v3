import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import EventSeatGrid from "../components/EventSeatGrid";

const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤", "Concert": "🎵", "Theatre": "🎭",
  "Festival": "🎪", "Sports": "🏟️", "Conference": "🧠", "Other": "✨",
};

// VIP seats are the first N seats (rows A–B by default).
// We derive vipCount from slot.vipSeats if available, otherwise default to 16 (2 rows of 8)
function getVipCount(slot) {
  if (slot?.vipSeats != null) return slot.vipSeats;
  const total = slot?.totalSeats ?? 0;
  if (total <= 16) return 0;           // tiny venue — all GA
  return Math.min(16, Math.floor(total * 0.2)); // up to 20% VIP
}

function getVipPrice(slot) {
  return slot?.vipPrice ?? Math.round((slot?.price ?? 0) * 1.5);
}

function isVipSeat(label, vipCount, seatsPerRow = 8) {
  const rowIndex = label.charCodeAt(0) - 65; // A=0, B=1 …
  const seatNum = parseInt(label.slice(1), 10) - 1;
  const seatIndex = rowIndex * seatsPerRow + seatNum;
  return seatIndex < vipCount;
}

function EventBookingPage() {
  const { eventId, slotId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent]           = useState(null);
  const [seatState, setSeatState]   = useState({ bookedSeats: [], lockedSeats: [] });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const slot = useMemo(() => event?.slots?.find((s) => s._id === slotId), [event, slotId]);
  const vipCount = useMemo(() => getVipCount(slot), [slot]);
  const vipPrice = useMemo(() => getVipPrice(slot), [slot]);
  const gaPrice  = useMemo(() => slot?.price ?? 0, [slot]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, seatRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/booking/seats/status/${slotId}`),
      ]);
      setEvent(eventRes.data);
      setSeatState(seatRes.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [eventId, slotId]);

  const toggleSeat = (label) =>
    setSelectedSeats((cur) =>
      cur.includes(label) ? cur.filter((s) => s !== label) : [...cur, label]
    );

  const selectedVip = selectedSeats.filter((s) => isVipSeat(s, vipCount));
  const selectedGA  = selectedSeats.filter((s) => !isVipSeat(s, vipCount));
  const totalAmount = selectedVip.length * vipPrice + selectedGA.length * gaPrice;

  const proceedToPayment = async () => {
    if (!slot || selectedSeats.length === 0) { setError("Select at least one seat."); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/booking/seats/lock", { showId: slotId, seatNumbers: selectedSeats });

      const res = await api.post("/booking/bookings", {
        movieId:       eventId,
        movieTitle:    event.title,
        showId:        slotId,
        showStartTime: slot.startTime,
        amount:        totalAmount,
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

  if (loading) return <div className="page-shell text-center text-white/60">Loading seat map...</div>;
  if (!event || !slot) return <div className="page-shell text-center text-white/60">Slot not found.</div>;

  const emoji = CATEGORY_EMOJI[event.category] || "✨";

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        <EventSeatGrid
          totalSeats={slot.totalSeats}
          vipCount={vipCount}
          bookedSeats={seatState.bookedSeats}
          lockedSeats={seatState.lockedSeats}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeat}
        />

        <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">{emoji} {event.category}</p>
            <h1 className="title-font mt-3 text-3xl font-semibold">{event.title}</h1>
            <p className="mt-1 text-sm text-white/50 italic">{event.artist}</p>
            <p className="mt-3 text-sm text-white/65">
              {slot.venueName} · {slot.city} · {slot.section}
            </p>
            <p className="mt-2 text-sm text-white/80">{new Date(slot.startTime).toLocaleString()}</p>
          </div>

          {/* Pricing tiers */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Ticket Prices</p>
            {vipCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                  <span className="text-sm text-purple-200">★ VIP</span>
                </div>
                <span className="text-sm font-semibold text-purple-200">₹{vipPrice}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                <span className="text-sm text-white/70">General Admission</span>
              </div>
              <span className="text-sm font-semibold text-white/70">₹{gaPrice}</span>
            </div>
          </div>

          {/* Selected seats summary */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
            {selectedVip.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200/70">VIP ({selectedVip.join(", ")})</span>
                <span className="text-purple-200">₹{selectedVip.length * vipPrice}</span>
              </div>
            )}
            {selectedGA.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">GA ({selectedGA.join(", ")})</span>
                <span className="text-white/80">₹{selectedGA.length * gaPrice}</span>
              </div>
            )}
            {selectedSeats.length === 0 && (
              <p className="text-xs text-white/30 text-center py-1">No seats selected</p>
            )}
            {selectedSeats.length > 0 && (
              <div className="flex items-center justify-between text-base font-semibold border-t border-white/10 pt-2 mt-2">
                <span>Total</span>
                <span className="text-amber-200">₹{totalAmount}</span>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="button"
            disabled={submitting || selectedSeats.length === 0}
            onClick={proceedToPayment}
            className="mt-auto w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60"
          >
            {submitting ? "Locking seats…" : `Proceed to Payment →`}
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default EventBookingPage;
