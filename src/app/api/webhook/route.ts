import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";
import { notifyPaymentReceived } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (process.env.PAYSTACK_SECRET_KEY && signature) {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const updatedOrder = await prisma.order.update({
      where: { orderNumber: reference },
      data: {
        status: "PAID",
        paymentStatus: "paid",
        paymentRef: event.data.id?.toString(),
      },
    });

    await notifyPaymentReceived(updatedOrder.id);
  }

  return apiSuccess({ received: true });
}
