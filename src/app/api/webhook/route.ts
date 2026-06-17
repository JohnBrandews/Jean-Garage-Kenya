import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";

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
    await prisma.order.updateMany({
      where: { orderNumber: reference },
      data: {
        status: "PAID",
        paymentStatus: "paid",
        paymentRef: event.data.id?.toString(),
      },
    });
  }

  return apiSuccess({ received: true });
}
