import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";

// ── tiny helpers ───────────────────────────────────────────────────────────
const fmtCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const fmtExpiry = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const cardBrand = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return { label: "Visa", color: "text-blue-300" };
  if (/^5[1-5]/.test(n)) return { label: "Mastercard", color: "text-orange-300" };
  if (/^3[47]/.test(n)) return { label: "Amex", color: "text-green-300" };
  if (/^6/.test(n)) return { label: "RuPay", color: "text-purple-300" };
  return null;
};

const validateCard = ({ number, expiry, cvv, name }) => {
  const errors = {};
  const digits = number.replace(/\s/g, "");
  if (digits.length < 16) errors.number = "Enter a valid 16-digit card number";
  const [mm, yy] = expiry.split("/");
  const now = new Date();
  const expDate = new Date(2000 + Number(yy), Number(mm) - 1);
  if (!mm || !yy || Number(mm) > 12 || Number(mm) < 1 || expDate < now)
    errors.expiry = "Enter a valid expiry date";
  if (cvv.length < 3) errors.cvv = "Enter a valid CVV";
  if (name.trim().length < 2) errors.name = "Enter the name on your card";
  return errors;
};

// ── Credit card preview ────────────────────────────────────────────────────
function CardPreview({ number, name, expiry, flipped }) {
  const brand = cardBrand(number);
  const display = number || "•••• •••• •••• ••••";

  return (
    <div className="perspective-1000 h-44 w-full max-w-sm mx-auto">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-amber-600/80 via-amber-800/60 to-black border border-white/10 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-7 rounded bg-amber-300/40 border border-amber-200/30" />
            {brand && <span className={`text-sm font-bold tracking-wider ${brand.color}`}>{brand.label}</span>}
          </div>
          <div>
            <p className="title-font text-xl tracking-[0.2em] text-white/90 font-semibold">
              {display}
            </p>
            <div className="mt-3 flex justify-between items-end">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Card Holder</p>
                <p className="text-sm text-white/80 font-medium truncate max-w-[160px]">
                  {name || "YOUR NAME"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Expires</p>
                <p className="text-sm text-white/80 font-medium">{expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex flex-col justify-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-10 bg-black/60 w-full mb-6" />
          <div className="px-6 flex justify-end items-center gap-3">
            <div className="flex-1 h-8 bg-white/10 rounded" />
            <div className="bg-amber-100 text-black text-sm font-bold px-3 py-1 rounded font-mono tracking-widest min-w-[56px] text-center">
              CVV
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]   = useState(null);
  const [loadErr, setLoadErr]   = useState("");

  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [errors, setErrors]     = useState({});
  const [cvvFocus, setCvvFocus] = useState(false);
  const [paying, setPaying]     = useState(false);
  const [payErr, setPayErr]     = useState("");

  // Load booking summary
  useEffect(() => {
    api.get(`/booking/bookings/${bookingId}`)
      .then((r) => setBooking(r.data))
      .catch((e) => setLoadErr(e.response?.data?.message || "Unable to load booking."));
  }, [bookingId]);

  const setField = (field, raw) => {
    let value = raw;
    if (field === "number") value = fmtCardNumber(raw);
    if (field === "expiry") value = fmtExpiry(raw);
    if (field === "cvv")    value = raw.replace(/\D/g, "").slice(0, 4);
    if (field === "name")   value = raw.toUpperCase();
    setCard((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handlePay = async () => {
    const errs = validateCard(card);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setPaying(true);
    setPayErr("");

    // Simulate a brief "processing" delay, then navigate to status page
    // The real payment processing is already happening via RabbitMQ in the background
    try {
      await new Promise((res) => setTimeout(res, 1800));
      navigate(`/payment-status/${bookingId}`);
    } catch {
      setPayErr("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  if (loadErr) return (
    <div className="page-shell">
      <div className="glass-panel mx-auto max-w-md rounded-[2rem] p-8 text-center">
        <p className="text-red-300">{loadErr}</p>
      </div>
    </div>
  );

  if (!booking) return (
    <div className="page-shell text-center text-white/50">
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-4xl"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-amber-200/70">Checkout</p>
        <h1 className="title-font text-3xl font-semibold mb-8">Payment Details</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── Left: Card form ── */}
          <div className="glass-panel rounded-[2rem] p-8 space-y-6">

            {/* Card preview */}
            <CardPreview
              number={card.number}
              name={card.name}
              expiry={card.expiry}
              flipped={cvvFocus}
            />

            {/* Card holder name */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Name on Card</label>
              <input
                type="text"
                placeholder="JOHN DOE"
                value={card.name}
                onChange={(e) => setField("name", e.target.value)}
                className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm outline-none transition font-mono tracking-wider placeholder:text-white/20 ${errors.name ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-amber-300/50"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Card number */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => setField("number", e.target.value)}
                  className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm outline-none transition font-mono tracking-widest placeholder:text-white/20 ${errors.number ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-amber-300/50"}`}
                />
                {cardBrand(card.number) && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${cardBrand(card.number).color}`}>
                    {cardBrand(card.number).label}
                  </span>
                )}
              </div>
              {errors.number && <p className="mt-1 text-xs text-red-400">{errors.number}</p>}
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Expiry</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setField("expiry", e.target.value)}
                  className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm outline-none transition font-mono tracking-widest placeholder:text-white/20 ${errors.expiry ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-amber-300/50"}`}
                />
                {errors.expiry && <p className="mt-1 text-xs text-red-400">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2">CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="•••"
                  value={card.cvv}
                  onFocus={() => setCvvFocus(true)}
                  onBlur={() => setCvvFocus(false)}
                  onChange={(e) => setField("cvv", e.target.value)}
                  className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm outline-none transition font-mono tracking-widest placeholder:text-white/20 ${errors.cvv ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-amber-300/50"}`}
                />
                {errors.cvv && <p className="mt-1 text-xs text-red-400">{errors.cvv}</p>}
              </div>
            </div>

            <p className="text-xs text-white/30 flex items-center gap-1.5">
              🔒 Your payment details are encrypted and secure
            </p>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="space-y-4">
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70 mb-4">Order Summary</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Title</p>
                  <p className="mt-0.5 font-semibold text-lg leading-tight">{booking.movieTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Date & Time</p>
                  <p className="mt-0.5 text-sm text-white/80">
                    {new Date(booking.showStartTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {new Date(booking.showStartTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Seats</p>
                  <p className="mt-0.5 text-sm text-white/80">{booking.seatNumbers.join(", ")}</p>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="text-white/60 text-sm">{booking.seatNumbers.length} ticket{booking.seatNumbers.length > 1 ? "s" : ""}</span>
                  <span className="text-2xl font-bold text-amber-200">₹{booking.amount}</span>
                </div>
              </div>
            </div>

            {payErr && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {payErr}
              </p>
            )}

            <button
              type="button"
              disabled={paying}
              onClick={handlePay}
              className="w-full rounded-2xl bg-amber-300 px-4 py-4 font-bold text-black text-base transition hover:bg-amber-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Processing…
                </>
              ) : (
                <>Pay ₹{booking.amount}</>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
            >
              ← Go back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
