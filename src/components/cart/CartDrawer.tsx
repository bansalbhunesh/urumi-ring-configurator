"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useCart } from "@/hooks/useProduct";
import { formatPrice } from "@/lib/format";
import { BagIcon, CloseIcon } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const open = useConfigurator((s) => s.cartOpen);
  const close = useConfigurator((s) => s.closeCart);
  const { data: cart } = useCart();
  const symbol = cart?.currencySymbol ?? "$";
  const items = cart?.items ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ivory shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            role="dialog"
            aria-label="Your bag"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <span className="eyebrow">Your Bag</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="text-ink-soft transition-colors hover:text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <BagIcon className="h-10 w-10 text-line" />
                  <p className="text-ink-soft">Your bag is empty.</p>
                  <button
                    type="button"
                    onClick={close}
                    className="text-sm tracking-wide text-gold underline-offset-4 hover:underline"
                  >
                    Continue configuring
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <motion.li
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 border-b border-line pb-5"
                    >
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-champagne text-gold">
                        ◆
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-lg leading-tight text-ink">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[0.8rem] text-muted">
                          {item.attributes.map((a) => a.value).join(" · ")}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] uppercase tracking-wide text-muted">
                          {item.sku} · Qty {item.quantity}
                        </p>
                      </div>
                      <div className="font-display text-lg text-ink">
                        {formatPrice(item.total, symbol)}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.16em] text-ink-soft">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl text-ink">
                    {formatPrice(cart?.total ?? 0, symbol)}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-5 h-13 w-full rounded-full bg-ink py-3.5 text-[0.9rem] uppercase tracking-[0.08em] text-porcelain transition-opacity hover:opacity-90"
                >
                  Proceed to Checkout
                </button>
                <p className="mt-3 text-center text-[0.72rem] text-muted">
                  {cart?.live
                    ? "Cart synced with WooCommerce"
                    : "Demo cart · WooCommerce not reachable"}
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
