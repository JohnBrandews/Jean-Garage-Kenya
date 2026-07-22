import { NextRequest } from "next/server";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notifyOrderStatusChanged, notifyPaymentReceived } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const previousOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true, paymentStatus: true },
    });

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
        ...(body.trackingNumber ? { trackingNumber: body.trackingNumber } : {}),
      },
    });

    if (body.paymentStatus === "paid" && body.paymentStatus !== previousOrder?.paymentStatus) {
      await notifyPaymentReceived(order.id);
    } else if (body.status && body.status !== previousOrder?.status) {
      await notifyOrderStatusChanged(order.id, order.status);
    }

    return apiSuccess(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500);
  }
}
