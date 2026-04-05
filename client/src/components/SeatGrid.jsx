function SeatGrid({ totalSeats, bookedSeats, lockedSeats, selectedSeats, onToggleSeat }) {
  const seatLabels = Array.from({ length: totalSeats }, (_, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 8));
    return `${row}${(index % 8) + 1}`;
  });

  return (
    <div className="glass-panel seat-grid-pattern rounded-3xl border border-white/10 bg-cinema-grid bg-[length:18px_18px] p-6">
      <div className="mx-auto mb-6 h-3 w-full max-w-md rounded-full bg-gradient-to-r from-amber-200/20 via-amber-200 to-amber-200/20" />
      <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-white/50">
        Screen
      </p>
      <div className="grid gap-3 sm:grid-cols-8">
        {seatLabels.map((seatLabel) => {
          const isBooked = bookedSeats.includes(seatLabel);
          const isLocked = lockedSeats.includes(seatLabel);
          const isSelected = selectedSeats.includes(seatLabel);
          const isDisabled = isBooked || isLocked;

          return (
            <button
              key={seatLabel}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggleSeat(seatLabel)}
              className={[
                "rounded-2xl border px-3 py-4 text-sm font-semibold transition",
                isSelected
                  ? "border-amber-300 bg-amber-300 text-black"
                  : isBooked
                    ? "border-red-400/30 bg-red-400/20 text-red-100"
                    : isLocked
                      ? "border-orange-300/30 bg-orange-300/20 text-orange-100"
                      : "border-white/10 bg-white/5 text-white hover:border-amber-200/60 hover:bg-white/10"
              ].join(" ")}
            >
              {seatLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeatGrid;
