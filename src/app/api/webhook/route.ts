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
      return new Response("Invalid signature", { status: 401 });
    }

    const expectedSignature = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const providedBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body) as {
      event?: string;
      data?: { reference?: string; id?: string | number };
    };

    if (event.event !== "charge.success") {
      return apiSuccess({ received: true });
    }

    const reference = event.data?.reference;
    if (!reference) {
      return new Response("Payment reference missing", { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const wasAlreadyPaid = order.paymentStatus === "paid";
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status === "PENDING" ? "PAID" : order.status,
        paymentStatus: "paid",
        paymentRef: event.data?.id?.toString() || reference,
      },
    });

    if (!wasAlreadyPaid) {
      await notifyPaymentReceived(updatedOrder.id);
    }

    return apiSuccess({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
}
