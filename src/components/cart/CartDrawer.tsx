"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useCart, useRemoveFromCart, useUpdateCartItem, useCheckout } from "@/hooks/useProduct";
import { formatPrice } from "@/lib/format";
import { BagIcon, CloseIcon, StoneGlyph } from "@/components/ui/icons";
import { METALS, STONES } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;

function QuantityStepper({
  itemKey,
  quantity,
}: {
  itemKey: string;
  quantity: number;
}) {
  const update = useUpdateCartItem();
  const remove = useRemoveFromCart();

  const dec = () => {
    if (quantity <= 1) remove.mutate({ key: itemKey });
    else update.mutate({ key: itemKey, quantity: quantity - 1 });
  };
  const inc = () => {
    if (quantity >= 10) return;
    update.mutate({ key: itemKey, quantity: quantity + 1 });
  };

  const busy = update.isPending || remove.isPending;

  return (
    <div className="flex items-center gap-1 rounded-full border border-line px-1 py-0.5">
      <button
        type="button"
        onClick={dec}
        disabled={busy}
        aria-label="Decrease quantity"
        className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-champagne hover:text-ink disabled:opacity-40 outline-none focus-visible:ring-1 focus-visible:ring-gold"
      >
        -
      </button>
      <span className="min-w-[1.4rem] text-center text-[0.8rem] font-medium text-ink">
        {busy ? "..." : quantity}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={busy || quantity >= 10}
        aria-label="Increase quantity"
        className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-champagne hover:text-ink disabled:opacity-40 outline-none focus-visible:ring-1 focus-visible:ring-gold"
      >
        +
      </button>
    </div>
  );
}

function RemoveButton({ itemKey }: { itemKey: string }) {
  const remove = useRemoveFromCart();
  return (
    <button
      type="button"
      onClick={() => remove.mutate({ key: itemKey })}
      disabled={remove.isPending}
      aria-label="Remove item"
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40 outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
    >
      <CloseIcon className="h-3.5 w-3.5" />
    </button>
  );
}

export function CartDrawer() {
  const open = useConfigurator((s) => s.cartOpen);
  const close = useConfigurator((s) => s.closeCart);
  const { data: cart } = useCart();
  const checkout = useCheckout();
  const symbol = cart?.currencySymbol ?? "$";
  const items = cart?.items ?? [];
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const handleCheckout = () => {
    setCheckoutError(null);
    checkout.mutate(undefined, {
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setCheckoutError(
            "Checkout is not available in demo mode. Connect a live store to proceed.",
          );
        }
      },
      onError: () => {
        setCheckoutError("Something went wrong. Please try again.");
      },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          />
          <motion.aside
            ref={drawerRef}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ivory shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <span className="eyebrow">
                Your Bag
                {items.length > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] font-semibold text-black">
                    {cart?.itemCount}
                  </span>
                )}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="grid h-11 w-11 place-items-center rounded-full text-ink-soft outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <BagIcon className="h-10 w-10 text-line" />
                  <p className="text-ink-soft">Your bag is empty.</p>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md px-3 py-2 text-sm tracking-wide text-gold underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    Continue configuring
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const metalOpt = METALS.find(
                        (m) =>
                          m.label ===
                          item.attributes.find((a) => a.label === "Metal")?.value,
                      );
                      const stoneOpt = STONES.find(
                        (s) =>
                          s.label ===
                          item.attributes.find((a) => a.label === "Stone")?.value,
                      );
                      return (
                        <motion.li
                          key={item.key}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
                          className="flex gap-4 border-b border-line pb-5"
                        >
                          {/* Metal swatch thumbnail */}
                          <div
                            className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-line"
                            style={{
                              background: metalOpt
                                ? `radial-gradient(120% 120% at 30% 25%, ${metalOpt.swatch[0]}, ${metalOpt.swatch[1]})`
                                : "var(--color-champagne)",
                            }}
                            aria-hidden
                          >
                            {stoneOpt && (
                              <StoneGlyph
                                stone={stoneOpt.id}
                                className="h-7 w-7 text-black/55"
                              />
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg leading-tight text-ink">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[0.8rem] text-muted">
                              {item.attributes.map((a) => a.value).join(" / ")}
                            </p>
                            <p className="mt-0.5 text-[0.7rem] uppercase tracking-wide text-muted">
                              {item.sku}
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                              <QuantityStepper
                                itemKey={item.key}
                                quantity={item.quantity}
                              />
                              <RemoveButton itemKey={item.key} />
                            </div>
                          </div>

                          {/* Line total */}
                          <div className="shrink-0 font-display text-lg text-ink">
                            {formatPrice(item.total, symbol)}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-line px-6 py-6">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.16em] text-ink-soft">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl text-ink">
                    {formatPrice(cart?.total ?? 0, symbol)}
                  </span>
                </div>

                {/* Checkout error */}
                <AnimatePresence>
                  {checkoutError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[0.78rem] text-amber-800"
                    >
                      {checkoutError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkout.isPending}
                  className="mt-5 h-13 w-full rounded-full bg-ink py-3.5 text-[0.9rem] uppercase tracking-[0.08em] text-porcelain outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkout.isPending ? "Opening checkout..." : "Proceed to Checkout"}
                </button>
                <p className="mt-3 text-center text-[0.72rem] text-muted">
                  {cart?.live
                    ? "Your bag is secured / 256-bit encrypted checkout"
                    : "Demo mode - connect a live store to complete purchase"}
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

