import Link from "next/link";
import { CheckCircle2, Clock3, MessageCircle, PackageCheck, Truck, CircleDot } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderTracking = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  deliveryAddress?: string;
  trackingNumber?: string | null;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function parseCity(deliveryAddress?: string) {
  if (!deliveryAddress) return null;
  try {
    const parsed = JSON.parse(deliveryAddress) as { city?: string };
    return parsed.city || null;
  } catch {
    return null;
  }
}

export function OrderTrackingTimeline({ order }: { order: OrderTracking }) {
  const isDelivered = order.status === "DELIVERED";
  const isShipped = ["SHIPPED", "DELIVERED"].includes(order.status);
  const isPaid = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);

  const steps = [
    {
      label: "Order placed",
      detail: "Payment received and order entered into the garage queue.",
      active: true,
      icon: Clock3,
      time: formatDate(order.createdAt),
    },
    {
      label: "Processing",
      detail: "The team is packing and quality-checking your items.",
      active: isPaid,
      icon: PackageCheck,
      time: isPaid ? formatDate(order.updatedAt) : "Waiting for admin update",
    },
    {
      label: "Dispatched",
      detail: "Your parcel has been handed over to the courier.",
      active: isShipped,
      icon: Truck,
      time: isShipped ? formatDate(order.updatedAt) : "Awaiting dispatch",
    },
    {
      label: "Out for delivery",
      detail: "The courier is on the final stretch to your address.",
      active: isDelivered,
      icon: CircleDot,
      time: isDelivered ? formatDate(order.updatedAt) : "Coming soon",
    },
    {
      label: "Delivered",
      detail: "Order has reached you successfully.",
      active: isDelivered,
      icon: CheckCircle2,
      time: isDelivered ? formatDate(order.updatedAt) : "Pending delivery",
    },
  ];

  const statusLabel =
    order.status === "DELIVERED"
      ? "Delivered"
      : order.status === "SHIPPED"
        ? "In transit"
        : order.status === "PROCESSING"
          ? "Processing"
          : order.status === "PAID"
            ? "Payment received"
            : "Order placed";

  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-[#1f1f1f] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-10">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-white/45">Order number</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{order.orderNumber}</h3>
        </div>
        <div className="inline-flex rounded-full border border-gold/40 px-4 py-2 text-sm font-semibold text-gold">
          {statusLabel}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="grid grid-cols-[56px_1fr] gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border ${
                    step.active ? "border-gold bg-gold text-white" : "border-white/15 bg-white/5 text-white/35"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`mt-2 h-16 w-px ${step.active ? "bg-gold/80" : "bg-white/10"}`} />
                )}
              </div>
              <div className="pb-2">
                <h4 className={`text-xl font-semibold ${step.active ? "text-white" : "text-white/35"}`}>
                  {step.label}
                </h4>
                <p className={`mt-1 text-sm ${step.active ? "text-white/55" : "text-white/30"}`}>{step.time}</p>
                <p className={`mt-3 text-sm leading-6 ${step.active ? "text-white/55" : "text-white/25"}`}>
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-white/40">Delivering to</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {parseCity(order.deliveryAddress) || "Your address"}
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-white/40">Estimated / order total</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatPrice(order.total)}</p>
        </div>
      </div>

      {order.trackingNumber && (
        <p className="mt-6 text-sm text-white/55">
          Tracking number: <span className="font-semibold text-white">{order.trackingNumber}</span>
        </p>
      )}

      <div className="mt-8 border-t border-white/10 pt-6">
        <Link
          href="https://wa.me/254700123456"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 rounded-[1rem] border border-gold/40 px-5 py-4 text-base font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
        >
          <MessageCircle className="h-5 w-5" />
          Contact us on WhatsApp
        </Link>
      </div>
    </div>
  );
}
