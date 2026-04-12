// EventSeatGrid — VIP + General Admission layout (no screen bar)
// VIP: rows A–B (front, premium)  |  GA: rows C–onward

function EventSeatGrid({
  totalSeats,
  vipCount = 0,
  bookedSeats,
  lockedSeats,
  selectedSeats,
  onToggleSeat,
}) {
  // Build seat labels: VIP rows first (A, B…), then GA
  const seatsPerRow = 8;
  const totalVipRows = Math.ceil(vipCount / seatsPerRow);

  const allLabels = Array.from({ length: totalSeats }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / seatsPerRow));
    return `${row}${(i % seatsPerRow) + 1}`;
  });

  const vipLabels = allLabels.slice(0, vipCount);
  const gaLabels = allLabels.slice(vipCount);

  const SeatButton = ({ label, isVip }) => {
    const isBooked = bookedSeats.includes(label);
    const isLocked = lockedSeats.includes(label);
    const isSelected = selectedSeats.includes(label);
    const isDisabled = isBooked || isLocked;

    return (
      <button
        key={label}
        type="button"
        disabled={isDisabled}
        onClick={() => onToggleSeat(label)}
        title={isVip ? "VIP Seat" : "General Admission"}
        className={[
          "relative rounded-xl border px-2 py-3 text-xs font-semibold transition flex flex-col items-center gap-0.5",
          isSelected
            ? isVip
              ? "border-purple-300 bg-purple-400 text-white shadow-lg shadow-purple-500/30"
              : "border-amber-300 bg-amber-300 text-black"
            : isBooked
              ? "border-red-400/30 bg-red-400/20 text-red-200/60 cursor-not-allowed"
              : isLocked
                ? "border-orange-300/30 bg-orange-300/15 text-orange-200/60 cursor-not-allowed"
                : isVip
                  ? "border-purple-400/30 bg-purple-400/10 text-purple-200 hover:border-purple-400/60 hover:bg-purple-400/20"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-amber-200/50 hover:bg-white/10",
        ].join(" ")}
      >
        <span>{label}</span>
        {isBooked && <span className="text-[8px] opacity-70">taken</span>}
        {isLocked && !isBooked && <span className="text-[8px] opacity-70">held</span>}
      </button>
    );
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-6">

      {/* Stage / Venue indicator */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <span className="text-base">🎪</span>
            <span className="text-xs uppercase tracking-[0.25em] text-white/50">Stage / Venue</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* VIP section */}
      {vipLabels.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-300">
              ★ VIP
            </span>
            <span className="text-xs text-white/35">Premium experience · front rows</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {vipLabels.map((label) => (
              <SeatButton key={label} label={label} isVip />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {vipLabels.length > 0 && gaLabels.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10 border-dashed" style={{ borderTop: "1px dashed rgba(255,255,255,0.12)", height: 0 }} />
          <span className="text-[10px] uppercase tracking-widest text-white/25">General Admission below</span>
          <div className="flex-1" style={{ borderTop: "1px dashed rgba(255,255,255,0.12)", height: 0 }} />
        </div>
      )}

      {/* GA section */}
      {gaLabels.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/50">
              General Admission
            </span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {gaLabels.map((label) => (
              <SeatButton key={label} label={label} isVip={false} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          <div className="h-3 w-3 rounded border border-purple-400/40 bg-purple-400/15" />
          VIP Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          <div className="h-3 w-3 rounded border border-white/15 bg-white/8" />
          GA Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          <div className="h-3 w-3 rounded border border-amber-300/60 bg-amber-300/80" />
          Selected
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          <div className="h-3 w-3 rounded border border-red-400/30 bg-red-400/20" />
          Booked
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/45">
          <div className="h-3 w-3 rounded border border-orange-300/30 bg-orange-300/15" />
          Held
        </div>
      </div>
    </div>
  );
}

export default EventSeatGrid;
