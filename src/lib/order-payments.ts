import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function finalizePaidOrderByReference(reference: string, paymentRef?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber: reference },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    if (order.paymentStatus === "paid") {
      return order;
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: order.status === "PENDING" ? "PAID" : order.status,
        paymentStatus: "paid",
        paymentRef: paymentRef || reference,
      },
    });

    for (const item of order.items) {
      await tx.productSize.updateMany({
        where: {
          productId: item.productId,
          size: item.size,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return updatedOrder;
  });
}

export async function verifyAndFinalizePaidOrder(reference: string) {
  const verified = await verifyPaystackTransaction(reference);

  if (!verified || verified.status !== "success") {
    return null;
  }

  const paymentRef = verified.id ? String(verified.id) : reference;
  return finalizePaidOrderByReference(reference, paymentRef);
}
