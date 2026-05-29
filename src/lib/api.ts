import type { CartState, ProductData } from "./types";

/** Client-side fetch helpers that talk to our own BFF route handlers. */

export async function fetchProduct(): Promise<ProductData> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

export async function fetchCart(): Promise<CartState> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
}

export async function postAddToCart(
  variationId: number,
  quantity = 1,
): Promise<CartState> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variationId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}
