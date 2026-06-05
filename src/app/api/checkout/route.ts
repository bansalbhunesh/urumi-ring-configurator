import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE } from "@/lib/woo";

export const dynamic = "force-dynamic";

/* ---- POST /api/checkout ---------------------------------------------------
   Returns the WooCommerce checkout URL with the cart token embedded so the
   user lands on a pre-filled cart. When WOOCOMMERCE_ENABLED is false (demo
   mode) this returns null and the UI should explain that checkout is not live.
--------------------------------------------------------------------------- */
export async function POST() {
  const enabled = process.env.WOOCOMMERCE_ENABLED === "true";
  const wooUrl = (process.env.WOOCOMMERCE_URL ?? "").replace(/\/$/, "");
  const checkoutBase =
    process.env.WOOCOMMERCE_CHECKOUT_URL ?? (wooUrl ? `${wooUrl}/checkout` : "");

  // Demo unless we have a real, absolute store checkout URL. Guarding on
  // checkoutBase prevents ever navigating to a relative "/checkout" (which 404s
  // on the frontend) when the store env is missing or misconfigured.
  if (!enabled || !/^https?:\/\//.test(checkoutBase)) {
    return NextResponse.json({ url: null, reason: "demo" }, { status: 200 });
  }

  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value;

  const url = cartToken
    ? `${checkoutBase}?cart_token=${encodeURIComponent(cartToken)}`
    : checkoutBase;

  return NextResponse.json({ url });
}
