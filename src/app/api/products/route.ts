import { NextResponse } from "next/server";
import { getProduct } from "@/lib/woo";
import { mockProduct } from "@/lib/mock";

// Always attempt the live store first; fall back to the seeded mock so the page
// is never empty (e.g. on Vercel where the WooCommerce container isn't reachable).
export const dynamic = "force-dynamic";

export async function GET() {
  const live = await getProduct();
  const product = live ?? mockProduct();
  return NextResponse.json(product, {
    headers: { "Cache-Control": "no-store" },
  });
}
