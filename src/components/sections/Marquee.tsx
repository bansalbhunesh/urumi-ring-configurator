const WORDS = [
  "Ethically sourced",
  "Conflict-free diamonds",
  "Recycled 18k gold",
  "Hand-finished",
  "Made to order",
  "Lifetime warranty",
];

export function Marquee() {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden border-y border-line bg-champagne/40 py-4">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-12 pr-12">
        {items.map((w, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-12 text-[0.7rem] uppercase tracking-[0.32em] text-ink-soft"
          >
            {w}
            <span className="text-gold">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
