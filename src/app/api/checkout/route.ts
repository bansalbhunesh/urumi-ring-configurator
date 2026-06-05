import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE, STORE_ENABLED, storeCheckoutUrl } from "@/lib/woo";

export const dynamic = "force-dynamic";

/* ---- POST /api/checkout ---------------------------------------------------
   Returns the WooCommerce checkout URL with the cart token embedded so the user
   lands on the store's checkout. Enablement + store URL are shared with the
   product/cart layer (woo.ts) so checkout is live exactly when they are — it no
   longer falls back to "demo" while products and cart are already live.
--------------------------------------------------------------------------- */
export async function POST() {
  const checkoutBase = storeCheckoutUrl();

  // Demo only when the store layer is off or we somehow lack an absolute URL.
  if (!STORE_ENABLED || !/^https?:\/\//.test(checkoutBase)) {
    return NextResponse.json({ url: null, reason: "demo" }, { status: 200 });
  }

  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value;

  const url = cartToken
    ? `${checkoutBase}?cart_token=${encodeURIComponent(cartToken)}`
    : checkoutBase;

  return NextResponse.json({ url });
}
