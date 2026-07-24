"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/providers/cart-provider";

type ClearCartWhenOrderPaidProps = {
  orderNumber?: string | null;
  paid: boolean;
};

export function ClearCartWhenOrderPaid({ orderNumber, paid }: ClearCartWhenOrderPaidProps) {
  const { clearCart } = useCart();
  const didClear = useRef(false);

  useEffect(() => {
    if (!orderNumber || didClear.current) return;

    let cancelled = false;

    const clearIfPaid = async () => {
      try {
        const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = await response.json();
        const order = payload?.data ?? payload;

        if (!cancelled && order?.paymentStatus === "paid") {
          didClear.current = true;
          clearCart();
        }
      } catch {
        // Ignore network hiccups and keep polling.
      }
    };

    if (paid) {
      didClear.current = true;
      clearCart();
      return;
    }

    clearIfPaid();
    const interval = window.setInterval(clearIfPaid, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [clearCart, orderNumber, paid]);

  return null;
}
