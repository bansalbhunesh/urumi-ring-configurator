export function Footer() {
  return (
    <footer className="relative border-t border-bench-line/40 bg-bench-deep px-6 py-14 sm:px-10">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(228,187,118,0.5), transparent)" }}
        aria-hidden
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-bench-gold">◆</span>
          <span className="text-[0.9rem] uppercase tracking-[0.4em] text-bench-ink">
            Aurelle
          </span>
        </div>
        <p className="text-[0.78rem] text-bench-muted">
          18k recycled gold · Conflict-free diamonds · Made to order
        </p>
        <p className="text-[0.78rem] text-bench-muted">
          &copy; {new Date().getFullYear()} Aurelle · All rights reserved
        </p>
      </div>
    </footer>
  );
}
