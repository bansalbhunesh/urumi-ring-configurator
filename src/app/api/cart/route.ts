import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CART_TOKEN_COOKIE,
  addToCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/woo";
import {
  mockAddToCart,
  mockGetCart,
  mockRemoveFromCart,
  mockUpdateCartItem,
} from "@/lib/mock";

export const dynamic = "force-dynamic";

const MOCK_COOKIE = "urumi_mock_cart";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

const MAX_QUANTITY = 10;

/* ---- GET: read current cart -------------------------------------------- */
export async function GET() {
  const jar = await cookies();
  const liveToken = jar.get(CART_TOKEN_COOKIE)?.value;
  const mockRaw = jar.get(MOCK_COOKIE)?.value;

  if (liveToken) {
    const result = await getCart(liveToken);
    if (result) {
      const res = NextResponse.json(result.cart);
      if (result.cartToken)
        res.cookies.set(CART_TOKEN_COOKIE, result.cartToken, COOKIE_OPTS);
      return res;
    }
  }

  const { cart, encoded } = mockGetCart(mockRaw);
  const res = NextResponse.json(cart);
  res.cookies.set(MOCK_COOKIE, encoded, COOKIE_OPTS);
  return res;
}

/* ---- POST: add item ------------------------------------------------------- */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    variationId?: number;
    quantity?: number;
  };
  const variationId = Number(body.variationId);
  const quantity = Math.min(MAX_QUANTITY, Math.max(1, Number(body.quantity ?? 1)));

  if (!variationId) {
    return NextResponse.json({ error: "variationId required" }, { status: 400 });
  }

  const jar = await cookies();
  const liveToken = jar.get(CART_TOKEN_COOKIE)?.value;
  const mockRaw = jar.get(MOCK_COOKIE)?.value;

  const live = await addToCart(variationId, quantity, liveToken);
  if (live) {
    const res = NextResponse.json(live.cart);
    if (live.cartToken)
      res.cookies.set(CART_TOKEN_COOKIE, live.cartToken, COOKIE_OPTS);
    return res;
  }

  const { cart, encoded } = mockAddToCart(variationId, quantity, mockRaw);
  const res = NextResponse.json(cart);
  res.cookies.set(MOCK_COOKIE, encoded, COOKIE_OPTS);
  return res;
}

/* ---- PATCH: update item quantity ----------------------------------------- */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    quantity?: number;
  };
  const key = String(body.key ?? "").trim();
  const quantity = Math.min(MAX_QUANTITY, Math.max(0, Number(body.quantity ?? 1)));

  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }

  const jar = await cookies();
  const liveToken = jar.get(CART_TOKEN_COOKIE)?.value;
  const mockRaw = jar.get(MOCK_COOKIE)?.value;

  const live = await updateCartItemQuantity(key, quantity, liveToken);
  if (live) {
    const res = NextResponse.json(live.cart);
    if (live.cartToken)
      res.cookies.set(CART_TOKEN_COOKIE, live.cartToken, COOKIE_OPTS);
    return res;
  }

  const { cart, encoded } = mockUpdateCartItem(key, quantity, mockRaw);
  const res = NextResponse.json(cart);
  res.cookies.set(MOCK_COOKIE, encoded, COOKIE_OPTS);
  return res;
}

/* ---- DELETE: remove item ------------------------------------------------- */
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string };
  const key = String(body.key ?? "").trim();

  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }

  const jar = await cookies();
  const liveToken = jar.get(CART_TOKEN_COOKIE)?.value;
  const mockRaw = jar.get(MOCK_COOKIE)?.value;

  const live = await removeCartItem(key, liveToken);
  if (live) {
    const res = NextResponse.json(live.cart);
    if (live.cartToken)
      res.cookies.set(CART_TOKEN_COOKIE, live.cartToken, COOKIE_OPTS);
    return res;
  }

  const { cart, encoded } = mockRemoveFromCart(key, mockRaw);
  const res = NextResponse.json(cart);
  res.cookies.set(MOCK_COOKIE, encoded, COOKIE_OPTS);
  return res;
}
