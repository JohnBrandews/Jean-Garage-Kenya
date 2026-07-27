"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

type OrderAction = "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export function OrderActionsDropdown({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<OrderAction | null>(null);
  const router = useRouter();

  const runAction = async (action: OrderAction) => {
    setLoading(action);

    const payload =
      action === "CANCELLED"
        ? { status: "CANCELLED", paymentStatus: "cancelled" }
        : { status: action };

    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(null);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative z-50 inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 border border-black/10 bg-white px-3 text-xs font-bold uppercase tracking-[0.18em] text-charcoal hover:border-gold hover:text-gold"
        aria-expanded={open}
      >
        Actions
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-52 overflow-hidden border border-black/10 bg-white shadow-2xl">
          <button
            type="button"
            onClick={() => runAction("PROCESSING")}
            disabled={loading !== null || currentStatus === "PROCESSING"}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-light-gray disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "PROCESSING" ? "Updating..." : "Mark as Processing"}
          </button>
          <button
            type="button"
            onClick={() => runAction("SHIPPED")}
            disabled={loading !== null || currentStatus === "SHIPPED"}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-light-gray disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "SHIPPED" ? "Updating..." : "Mark as Shipped"}
          </button>
          <button
            type="button"
            onClick={() => runAction("DELIVERED")}
            disabled={loading !== null || currentStatus === "DELIVERED"}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-light-gray disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "DELIVERED" ? "Updating..." : "Mark as Delivered"}
          </button>
          <button
            type="button"
            onClick={() => runAction("CANCELLED")}
            disabled={loading !== null || currentStatus === "CANCELLED"}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-light-gray disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "CANCELLED" ? "Updating..." : "Cancel Order"}
          </button>
        </div>
      )}
    </div>
  );
}
