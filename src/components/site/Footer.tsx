export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory px-6 py-14 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-gold">◆</span>
          <span className="text-[0.9rem] uppercase tracking-[0.4em] text-ink">
            Aurelle
          </span>
        </div>
        <p className="text-[0.78rem] text-muted">
          A prototype configurator · Built for the Urumi FDE take-home
        </p>
        <p className="text-[0.78rem] text-muted">
          Headless WooCommerce · React Three Fiber
        </p>
      </div>
    </footer>
  );
}
