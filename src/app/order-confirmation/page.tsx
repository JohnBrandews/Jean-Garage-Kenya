import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderTrackingTimeline } from "@/components/orders/order-tracking-timeline";
import { ClearCartWhenOrderPaid } from "@/components/orders/clear-cart-when-order-paid";

interface OrderConfirmationProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationProps) {
  const { order: orderNumber } = await searchParams;

  const order = orderNumber
        ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      })
    : null;

  const paymentComplete = order?.paymentStatus === "paid";

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury max-w-2xl mx-auto text-center">
        <ClearCartWhenOrderPaid orderNumber={orderNumber} paid={paymentComplete} />
        <CheckCircle className="mx-auto h-16 w-16 text-gold" />
        <h1 className="mt-6 font-display text-4xl font-bold text-charcoal">
          {paymentComplete ? "Order Confirmed!" : "Order Received!"}
        </h1>
        <p className="mt-4 text-gray-500">
          {paymentComplete
            ? "Thank you for shopping with JEANS GARAGE."
            : "Your Paystack payment is being processed. We will confirm it as soon as the gateway completes verification."}
        </p>

        {order && (
          <div className="mt-8 space-y-6 text-left">
            <div className="rounded-[1.5rem] border border-border p-6">
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold capitalize">{order.status.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-bold capitalize">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-4">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>
            <OrderTrackingTimeline
              order={{
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                total: Number(order.total),
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                deliveryAddress: order.deliveryAddress,
              }}
            />
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href={`/track-order?orderNumber=${order?.orderNumber || ""}`}>
            <Button variant="secondary">Track Order</Button>
          </Link>
          <Link href="/products">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
