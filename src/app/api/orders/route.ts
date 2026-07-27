import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { generateOrderNumber, getKenyaShippingCost } from "@/lib/utils";
import { notifyOrderCreated } from "@/lib/notifications";
import { initializePaystackPayment } from "@/lib/paystack";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber");
  if (!orderNumber) return apiError("Order number required", 400);

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  if (!order) return apiError("Order not found", 404);
  return apiSuccess(order);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    if (body.paymentMethod !== "PAYSTACK") {
      return apiError("Only Paystack payments are supported", 400);
    }

    let userId = session?.user?.id;

    if (!userId) {
      let user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user) {
        user = await prisma.user.create({
          data: { name: body.fullName, email: body.email },
        });
      }
      userId = user.id;
    }

    const orderNumber = generateOrderNumber();
    const deliveryAddress = JSON.stringify({
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      city: body.city,
      county: body.county,
      country: body.country,
    });
    const shippingCost =
      body.shippingRegion === "KENYA"
        ? getKenyaShippingCost(body.city, body.county)
        : body.shippingRegion === "EAST_AFRICA"
          ? 1500
          : 3500;
    const subtotal = Number(body.subtotal || 0);
    const total = subtotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        total,
        subtotal,
        shippingCost,
        status: "PENDING",
        paymentMethod: "PAYSTACK",
        paymentStatus: "pending",
        currency: body.currency || "KES",
        deliveryAddress,
        shippingRegion: body.shippingRegion,
        items: {
          create: body.items.map((item: { productId: string; size: string; quantity: number; price: number }) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const payment = await initializePaystackPayment({
      email: body.email,
      amountKobo: Math.round(Number(total) * 100),
      reference: orderNumber,
      callbackUrl: new URL(`/order-confirmation?order=${orderNumber}`, req.nextUrl.origin).toString(),
      metadata: {
        orderNumber,
        customerName: body.fullName,
        customerPhone: body.phone,
        shippingRegion: body.shippingRegion,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: payment.reference,
      },
    });

    await notifyOrderCreated(order.id);

    return apiSuccess({ orderNumber, orderId: order.id, paymentUrl: payment.authorization_url });
  } catch (error) {
    console.error(error);
    return apiError("Failed to create order", 500);
  }
}
