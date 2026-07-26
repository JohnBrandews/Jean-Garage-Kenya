import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";
import { notifyPaymentReceived } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) {
      console.error("Webhook: Missing secret or signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    const providedBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      console.error("Webhook: Signature mismatch", {
        provided: signature,
        expected: expectedSignature,
      });
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body) as {
      event?: string;
      data?: { 
        reference?: string; 
        id?: string | number;
        amount?: number;
        customer?: { email?: string };
      };
    };

    // Log every webhook received
    console.log("Webhook received:", {
      event: event.event,
      reference: event.data?.reference,
      amount: event.data?.amount,
      customerEmail: event.data?.customer?.email,
      timestamp: new Date().toISOString(),
    });

    if (event.event !== "charge.success") {
      console.log("Webhook: Ignoring non-charge event:", event.event);
      return apiSuccess({ received: true });
    }

    const reference = event.data?.reference;

    if (!reference) {
      console.error("Webhook: Payment reference missing in payload");
      return new Response("Payment reference missing", { status: 400 });
    }

    // Log what we're looking for
    console.log("Webhook: Looking for order with orderNumber:", reference);

    const order = await prisma.order.findUnique({ 
      where: { orderNumber: reference } 
    });

    // Log whether order was found
    console.log("Webhook: Order lookup result:", {
      found: !!order,
      orderId: order?.id ?? null,
      currentStatus: order?.status ?? null,
      currentPaymentStatus: order?.paymentStatus ?? null,
    });

    if (!order) {
      console.error("Webhook: No order found for reference:", reference);
      return new Response("Order not found", { status: 404 });
    }

    const wasAlreadyPaid = order.paymentStatus === "paid";

    if (wasAlreadyPaid) {
      console.log("Webhook: Order already paid, skipping update:", reference);
      return apiSuccess({ received: true });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status === "PENDING" ? "PAID" : order.status,
        paymentStatus: "paid",
        paymentRef: event.data?.id?.toString() || reference,
      },
    });

    console.log("Webhook: Order updated successfully:", {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      newStatus: updatedOrder.status,
      newPaymentStatus: updatedOrder.paymentStatus,
    });

    await notifyPaymentReceived(updatedOrder.id);

    return apiSuccess({ received: true });

  } catch (error) {
    console.error("Webhook: Unhandled error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
}