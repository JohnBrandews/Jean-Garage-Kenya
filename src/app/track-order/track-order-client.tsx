"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderTrackingTimeline } from "@/components/orders/order-tracking-timeline";

type TrackedOrder = {
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  deliveryAddress?: string;
};

export function TrackOrderClient({
  initialOrderNumber,
  initialOrder,
}: {
  initialOrderNumber: string;
  initialOrder: TrackedOrder | null;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState<TrackedOrder | null>(initialOrder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = (await res.json()) as TrackedOrder & { error?: string };
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury mx-auto max-w-4xl">
        <h1 className="text-center font-display text-4xl font-bold text-charcoal">Track Your Order</h1>
        <p className="mt-3 text-center text-gray-500">Enter your order number to see delivery updates</p>

        <form onSubmit={handleTrack} className="mt-10 flex gap-4">
          <Input
            label="Order Number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. JGK-XXXX-XXXX"
          />
          <div className="flex items-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Searching..." : "Track"}
            </Button>
          </div>
        </form>

        {error && <p className="mt-4 text-center text-red-600">{error}</p>}

        <div className="mt-12">
          {order ? (
            <OrderTrackingTimeline order={order} />
          ) : (
            <div className="rounded-[1.5rem] border border-border bg-light-gray p-10 text-center text-charcoal/60">
              Your tracking timeline will appear here once you look up an order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
