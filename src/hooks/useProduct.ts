"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchCart, fetchProduct, postAddToCart } from "@/lib/api";
import type { CartState } from "@/lib/types";

export function useProduct() {
  return useQuery({
    queryKey: ["product"],
    queryFn: fetchProduct,
  });
}

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      variationId,
      quantity = 1,
    }: {
      variationId: number;
      quantity?: number;
    }) => postAddToCart(variationId, quantity),
    onSuccess: (cart: CartState) => {
      qc.setQueryData(["cart"], cart);
    },
  });
}
