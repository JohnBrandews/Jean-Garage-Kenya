import { NextRequest } from "next/server";
import crypto from "crypto";
import { apiSuccess } from "@/lib/api-utils";
import { notifyPaymentReceived } from "@/lib/notifications";
import { finalizePaidOrderByReference } from "@/lib/order-payments";

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

    const updatedOrder = await finalizePaidOrderByReference(
      reference,
      event.data?.id?.toString() || reference
    );

    console.log("Webhook: Order lookup result:", {
      found: !!updatedOrder,
      orderId: updatedOrder?.id ?? null,
      currentStatus: updatedOrder?.status ?? null,
      currentPaymentStatus: updatedOrder?.paymentStatus ?? null,
    });

    if (!updatedOrder) {
      return new Response("Order not found", { status: 404 });
    }

    if (updatedOrder.paymentStatus !== "paid") {
      return apiSuccess({ received: true });
    }

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
