import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const CATEGORY_EMOJI = {
  "Standup Comedy": "🎤", "Concert": "🎵", "Theatre": "🎭",
  "Festival": "🎪", "Sports": "🏟️", "Conference": "🧠", "Other": "✨",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80";

export default function Carousel({ items, mode = "movies" }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  const next = useCallback(() => setActive((i) => (i + 1) % items.length), [items.length]);
  const prev = () => setActive((i) => (i - 1 + items.length) % items.length);

  const startTimer = useCallback(() => {
    clearInterval(timer.current);
    if (items.length > 1) timer.current = setInterval(next, 5500);
  }, [next, items.length]);

  useEffect(() => { startTimer(); return () => clearInterval(timer.current); }, [startTimer]);

  if (!items.length) return null;
  const item = items[active];
  const isMovie = mode === "movies";

  const tag1 = isMovie ? item.genre : `${CATEGORY_EMOJI[item.category] || "✨"} ${item.category}`;
  const tag2 = isMovie ? item.language : item.artist;
  const meta = isMovie
    ? `${item.durationMinutes} min · ${item.shows?.length ?? 0} show${item.shows?.length !== 1 ? "s" : ""}`
    : `${item.durationMinutes} min · ${item.slots?.length ?? 0} slot${item.slots?.length !== 1 ? "s" : ""}`;

  const bookLink = isMovie
    ? item.shows?.length > 0 ? `/movies/${item._id}/shows/${item.shows[0]._id}/book` : null
    : item.slots?.length > 0 ? `/events/${item._id}/slots/${item.slots[0]._id}/book` : null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10" style={{ minHeight: 400 }}
      onMouseEnter={() => clearInterval(timer.current)} onMouseLeave={startTimer}>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.65 }} className="absolute inset-0">
          <img src={item.posterUrl || FALLBACK} alt={item.title}
            className="h-full w-full object-cover object-center"
            onError={(e) => { e.target.src = FALLBACK; }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-5 top-5 z-10 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs uppercase tracking-widest text-white/50 backdrop-blur-sm">
        {isMovie ? "Now Showing" : "Upcoming"}
      </div>
      <div className="absolute right-5 bottom-5 z-10 text-xs text-white/35 tabular-nums">
        {active + 1} / {items.length}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-10" style={{ minHeight: 400 }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-0.5 text-xs uppercase tracking-widest text-amber-200">{tag1}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-xs text-white/70 max-w-[200px] truncate">{tag2}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-xs text-white/70">⭐ {item.rating}/5</span>
            </div>
            <h2 className="title-font text-3xl font-semibold leading-tight sm:text-4xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55 line-clamp-2">{item.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs text-white/40">{meta}</span>
              {bookLink && (
                <Link to={bookLink} className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-200 active:scale-95">
                  Book Now →
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} type="button" onClick={() => { setActive(i); startTimer(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-7 bg-amber-300" : "w-1.5 bg-white/25 hover:bg-white/50"}`} />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => { prev(); startTimer(); }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-base backdrop-blur-sm transition hover:bg-white/15">‹</button>
            <button type="button" onClick={() => { next(); startTimer(); }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-base backdrop-blur-sm transition hover:bg-white/15">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
