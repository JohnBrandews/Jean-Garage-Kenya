"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-border px-3 py-2 text-sm outline-none focus:border-gold"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:gold-gradient disabled:opacity-50"
      >
        {loading ? "..." : "Update"}
      </button>
    </div>
  );
}
