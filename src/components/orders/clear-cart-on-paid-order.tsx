"use client";

import { useEffect } from "react";
import { useCart } from "@/components/providers/cart-provider";

type ClearCartOnPaidOrderProps = {
  paid: boolean;
};

export function ClearCartOnPaidOrder({ paid }: ClearCartOnPaidOrderProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (paid) {
      clearCart();
    }
  }, [paid, clearCart]);

  return null;
}
