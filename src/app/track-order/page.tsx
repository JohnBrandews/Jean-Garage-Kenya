import { TrackOrderClient } from "./track-order-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TrackOrderPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const params = await searchParams;
  const initialOrderRecord = params.orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber: params.orderNumber },
      })
    : null;

  const initialOrder = initialOrderRecord
    ? {
        orderNumber: initialOrderRecord.orderNumber,
        total: Number(initialOrderRecord.total),
        status: initialOrderRecord.status,
        paymentStatus: initialOrderRecord.paymentStatus,
        trackingNumber: initialOrderRecord.trackingNumber,
        createdAt: initialOrderRecord.createdAt.toISOString(),
        updatedAt: initialOrderRecord.updatedAt.toISOString(),
        deliveryAddress: initialOrderRecord.deliveryAddress,
      }
    : null;

  return <TrackOrderClient initialOrderNumber={params.orderNumber || ""} initialOrder={initialOrder} />;
}
