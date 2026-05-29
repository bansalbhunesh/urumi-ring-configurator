import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE, addToCart, getCart } from "@/lib/woo";
import { mockAddToCart, mockGetCart } from "@/lib/mock";

export const dynamic = "force-dynamic";

const MOCK_COOKIE = "urumi_mock_cart";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    variationId?: number;
    quantity?: number;
  };
  const variationId = Number(body.variationId);
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!variationId) {
    return NextResponse.json({ error: "variationId required" }, { status: 400 });
  }

  const jar = await cookies();
  const liveToken = jar.get(CART_TOKEN_COOKIE)?.value;
  const mockRaw = jar.get(MOCK_COOKIE)?.value;

  // Live first (only meaningful when the variationId came from the live store).
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
